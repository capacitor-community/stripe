package com.getcapacitor.community.stripe.embedded

import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentManager
import com.getcapacitor.PluginCall
import org.junit.Assert.fail
import org.junit.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.times
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`

class EmbeddedPaymentElementExecutorTest {
    @Test
    fun queuedCheckoutActionsRejectAfterActivityExit() {
        val activity = mock(AppCompatActivity::class.java)
        `when`(activity.supportFragmentManager).thenReturn(mock(FragmentManager::class.java))
        val executor = EmbeddedPaymentElementExecutor(activity, mock(WebView::class.java), "Stripe") { _, _ ->
            fail("An unavailable activity must not emit checkout events")
        }
        val mount = mock(PluginCall::class.java)
        val confirm = mock(PluginCall::class.java)
        executor.mount(mount)
        executor.confirm(confirm)
        val queued = ArgumentCaptor.forClass(Runnable::class.java)
        verify(activity, times(2)).runOnUiThread(queued.capture())

        `when`(activity.isFinishing).thenReturn(true)
        queued.allValues[0].run()
        verify(mount).reject("Activity unavailable.")

        executor.destroy()
        `when`(activity.isFinishing).thenReturn(false)
        `when`(activity.isDestroyed).thenReturn(true)
        queued.allValues[1].run()
        verify(confirm).reject("Activity unavailable.")
    }
}
