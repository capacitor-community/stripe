package ca.zyra.capacitor.stripe

import com.stripe.android.EphemeralKeyProvider
import com.stripe.android.EphemeralKeyUpdateListener

internal class EphKeyProvider : EphemeralKeyProvider {
    override fun createEphemeralKey(apiVersion: String, keyUpdateListener: EphemeralKeyUpdateListener) {
        keyUpdateListener.onKeyUpdate(key!!)
    }

    companion object {
        private var key: String? = null

        fun setKey(key: String) {
            EphKeyProvider.key = key
        }
    }
}
