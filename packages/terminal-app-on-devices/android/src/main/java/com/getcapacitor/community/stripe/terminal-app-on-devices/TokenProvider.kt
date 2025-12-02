package com.getcapacitor.community.stripe.terminal-app-on-devices

import android.content.Context
import android.util.Log
import androidx.core.util.Supplier
import com.android.volley.Response
import com.android.volley.toolbox.StringRequest
import com.android.volley.toolbox.Volley
import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall
import com.google.android.gms.common.util.BiConsumer
import com.stripe.stripeterminal.external.callable.ConnectionTokenCallback
import com.stripe.stripeterminal.external.callable.ConnectionTokenProvider
import com.stripe.stripeterminal.external.models.ConnectionTokenException
import org.json.JSONException
import org.json.JSONObject
import java.util.Objects

class TokenProvider(
    protected var contextSupplier: Supplier<Context>,
    protected val tokenProviderEndpoint: String,
    protected var notifyListenersFunction: BiConsumer<String, JSObject>
) : ConnectionTokenProvider {
    private var pendingCallback: ArrayList<ConnectionTokenCallback> = ArrayList()

    fun setConnectionToken(call: PluginCall) {
        val token = call.getString("token", "")
        if (pendingCallback.isNotEmpty()) {
            val pending = pendingCallback.removeAt(0)
            if (token == "") {
                pending.onFailure(ConnectionTokenException("Missing `token` is empty"))
                call.reject("Missing `token` is empty")
            } else {
                pending.onSuccess(token!!)
                call.resolve()
            }
        } else {
            call.reject("Stripe Terminal do not pending fetchConnectionToken")
        }
    }

    override fun fetchConnectionToken(callback: ConnectionTokenCallback) {
        if (this.tokenProviderEndpoint == "") {
            pendingCallback.add(callback)
            this.notifyListeners(
                TerminalEnumEvent.RequestedConnectionToken.webEventName,
                JSObject()
            )
        } else {
            try {
                val queue = Volley.newRequestQueue(contextSupplier.get())
                val postRequest: StringRequest = object : StringRequest(
                    Method.POST,
                    this.tokenProviderEndpoint,
                    Response.Listener { response ->
                        try {
                            val jsonObject = JSONObject(response)
                            Log.d("TokenProvider", jsonObject.getString("secret"))
                            callback.onSuccess(jsonObject.getString("secret"))
                        } catch (e: JSONException) {
                            callback.onFailure(ConnectionTokenException(Objects.requireNonNull(e.localizedMessage)))
                            throw RuntimeException(e)
                        }
                    },
                    Response.ErrorListener { e -> throw RuntimeException(e) }
                ) {
                    //                @Override
                    //                protected Map<String,String> getParams(){
                    //                    Map<String,String> params = new HashMap<>();
                    //                    params.put("word","test");
                    //                    return params;
                    //                }
                }

                queue.add(postRequest)
            } catch (e: Exception) {
                callback.onFailure(ConnectionTokenException("Failed to fetch connection token", e))
            }
        }
    }

    protected fun notifyListeners(eventName: String?, data: JSObject?) {
        notifyListenersFunction.accept(eventName!!, data!!)
    }
}
