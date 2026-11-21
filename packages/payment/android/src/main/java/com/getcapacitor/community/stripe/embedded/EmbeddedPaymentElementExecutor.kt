package com.getcapacitor.community.stripe.embedded

import android.graphics.Rect
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.ComposeView
import androidx.fragment.app.Fragment
import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall
import com.stripe.android.PaymentConfiguration
import com.stripe.android.paymentelement.EmbeddedPaymentElement
import com.stripe.android.paymentelement.rememberEmbeddedPaymentElement
import com.stripe.android.paymentsheet.CreateIntentCallback
import com.stripe.android.paymentsheet.CreateIntentResult
import com.stripe.android.paymentsheet.PaymentSheet
import io.github.webview_native_ui.engine.NativeUIProjection
import org.json.JSONObject
import kotlin.math.roundToInt

/** The fragment scopes Stripe's saved state, activity result registrations and Compose UI to one checkout. */
class EmbeddedPaymentElementFragment : Fragment() {
    internal var render: ((ComposeView) -> Unit)? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View? =
        render?.let { ComposeView(requireContext()).apply(it) }
}

internal class EmbeddedPaymentElementExecutor(
    private val activity: AppCompatActivity,
    private val webView: WebView,
    private val pluginId: String,
    private val notify: (JSObject) -> Unit
) {
    private val installation = runCatching { NativeUIProjection.install(webView) }
    private var fragment: EmbeddedPaymentElementFragment? = null
    private var host: FrameLayout? = null
    private var projection: NativeUIProjection? = null
    private var element: EmbeddedPaymentElement? = null
    private var mounting: PluginCall? = null
    private var confirming: PluginCall? = null
    private var ready = false
    private var height = 0
    private var completed = false

    init {
        activity.supportFragmentManager.findFragmentByTag(TAG)?.let {
            activity.supportFragmentManager.beginTransaction().remove(it).commitNow()
        }
    }

    fun mount(call: PluginCall) {
        if (fragment != null) return call.reject("An embedded payment element is already mounted.")
        val selector = call.getString("selector")
        val secret = call.getString("paymentIntentClientSecret")
        val merchant = call.getString("merchantDisplayName")
        val currency = call.getString("currency")
        val amount = call.data.optLong("amount", -1)
        if (selector.isNullOrBlank() || secret.isNullOrBlank() || merchant.isNullOrBlank() ||
            currency.isNullOrBlank() || amount <= 0) return call.reject("Missing embedded payment configuration.")

        try {
            installation.getOrThrow()
            PaymentConfiguration.getInstance(activity)
            val parent = webView.parent as ViewGroup
            val frame = object : FrameLayout(activity) {
                // Measure the full SDK list even when a scroll container clips its visible portion.
                override fun measureChildWithMargins(child: View, w: Int, usedW: Int, h: Int, usedH: Int) {
                    child.measure(
                        MeasureSpec.makeMeasureSpec(child.layoutParams.width.coerceAtLeast(1), MeasureSpec.EXACTLY),
                        MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED)
                    )
                }
            }.also { host = it }
            // A zero-sized host keeps the view out of the touch path until its first DOM placement.
            parent.addView(frame, 0, 0)
            val owner = EmbeddedPaymentElementFragment().also { fragment = it }
            val intent = PaymentSheet.IntentConfiguration(PaymentSheet.IntentConfiguration.Mode.Payment(amount, currency))
            val config = EmbeddedPaymentElement.Configuration.Builder(merchant).build()
            val builder = EmbeddedPaymentElement.Builder(
                createIntentCallback = CreateIntentCallback { _, _ -> CreateIntentResult.Success(secret) },
                resultCallback = { result ->
                    if (fragment === owner) {
                        val status = when (result) {
                            is EmbeddedPaymentElement.Result.Completed -> "completed"
                            is EmbeddedPaymentElement.Result.Canceled -> "canceled"
                            is EmbeddedPaymentElement.Result.Failed -> "failed"
                        }
                        completed = status == "completed"
                        confirming?.resolve(JSObject().put("result", status))
                        confirming = null
                        emit()
                    }
                }
            )

            mounting = call
            owner.render = { view ->
                view.setContent {
                    val sdk = rememberEmbeddedPaymentElement(builder)
                    LaunchedEffect(sdk) {
                        when (val result = sdk.configure(intent, config)) {
                            is EmbeddedPaymentElement.ConfigureResult.Failed -> webView.post {
                                if (fragment === owner) {
                                    mounting?.reject(result.error.localizedMessage ?: "Stripe could not configure the element.")
                                    mounting = null
                                    destroy()
                                }
                            }
                            is EmbeddedPaymentElement.ConfigureResult.Succeeded -> {
                                element = sdk
                                mounting?.resolve()
                                mounting = null
                                sdk.paymentOption.collect {
                                    ready = it != null
                                    emit()
                                }
                            }
                        }
                    }
                    sdk.Content()
                }
            }
            activity.supportFragmentManager.beginTransaction().add(owner, TAG).commitNow()
            val content = owner.requireView()
            content.addOnLayoutChangeListener { _, _, top, _, bottom, _, _, _, _ ->
                val value = ((bottom - top) / webView.resources.displayMetrics.density).roundToInt()
                if (value > 0 && height != value) {
                    height = value
                    emit()
                }
            }
            frame.addView(content, FrameLayout.LayoutParams(webView.width, ViewGroup.LayoutParams.WRAP_CONTENT))
            projection = NativeUIProjection(
                window = activity.window, webView = webView, plugin = pluginId, projectionSelector = selector,
                receiveListeners = NativeUIProjection.ReceiveListeners(update = listOf("embeddedPaymentElementChange")),
                failedFallback = NativeUIProjection.FailedFallback.NATIVE,
                captureMode = NativeUIProjection.CaptureMode.VIEW,
                view = { content }
            )
        } catch (e: Exception) {
            mounting = null
            destroy()
            call.reject(e.localizedMessage ?: "Could not mount embedded payment element.", e)
        }
    }

    fun update(call: PluginCall) {
        val frame = host ?: return call.resolve()
        val content = fragment?.view ?: return call.resolve()
        val scale = webView.resources.displayMetrics.density
        val bounds = pixelBounds(call.data, scale)
        val clip = call.data.optJSONObject("clip")?.let { pixelBounds(it, scale) }
        val shown = call.getBoolean("visible")
        if (bounds == null || clip == null || shown == null) return call.reject("Invalid payment element placement.")
        val width = bounds.width().coerceAtLeast(1)
        val clippedWidth = if (shown) clip.width() else 0
        val clippedHeight = if (shown) clip.height() else 0
        frame.x = webView.x + clip.left
        frame.y = webView.y + clip.top
        frame.layoutParams.let {
            if (it.width != clippedWidth || it.height != clippedHeight) {
                it.width = clippedWidth
                it.height = clippedHeight
                frame.layoutParams = it
            }
        }
        content.translationX = (bounds.left - clip.left).toFloat()
        content.translationY = (bounds.top - clip.top).toFloat()
        content.layoutParams.let {
            if (it.width != width) {
                it.width = width
                content.layoutParams = it
            }
        }
        call.resolve()
    }

    fun confirm(call: PluginCall) {
        val sdk = element
        if (sdk == null || !ready || completed || confirming != null) return call.reject("Payment is not ready to confirm.")
        confirming = call
        emit()
        try {
            sdk.confirm()
        } catch (error: Exception) {
            confirming = null
            emit()
            call.reject(error.localizedMessage ?: "Could not confirm payment.", error)
        }
    }

    private fun emit() {
        val state = JSObject().put("ready", ready && !completed && confirming == null)
        if (height > 0) state.put("height", height)
        projection?.receive("embeddedPaymentElementChange", state)
        notify(state)
    }

    fun destroy() {
        val owner = fragment
        fragment = null
        projection?.close()
        projection = null
        mounting?.reject("Embedded payment element was removed.")
        confirming?.reject("Embedded payment element was removed.")
        mounting = null
        confirming = null
        owner?.render = null
        if (owner?.isAdded == true && !activity.supportFragmentManager.isDestroyed) {
            activity.supportFragmentManager.beginTransaction().remove(owner).commitNowAllowingStateLoss()
        }
        host?.let { (it.parent as? ViewGroup)?.removeView(it) }
        host = null
        element = null
        ready = false
        completed = false
        height = 0
    }

    private companion object {
        fun pixelBounds(data: JSONObject, scale: Float): Rect? {
            // MeasureSpec reserves two bits; this bound also keeps sums and offsets in Int range.
            val max = 0x3fffffff.toDouble()
            fun coordinate(key: String, minimum: Double): Int? {
                val value = (data.opt(key) as? Number)?.toDouble()?.times(scale) ?: return null
                return if (value in minimum..max) value.roundToInt() else null
            }
            val left = coordinate("x", -max) ?: return null
            val top = coordinate("y", -max) ?: return null
            val width = coordinate("width", 0.0) ?: return null
            val height = coordinate("height", 0.0) ?: return null
            return Rect(left, top, left + width, top + height)
        }

        const val TAG = "capacitor-stripe-embedded-payment"
    }
}
