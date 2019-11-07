package ca.zyra.capacitor.stripe

import com.stripe.android.EphemeralKeyProvider
import com.stripe.android.EphemeralKeyUpdateListener

internal class EphKeyProvider(internal val key: String) : EphemeralKeyProvider {
    override fun createEphemeralKey(apiVersion: String, keyUpdateListener: EphemeralKeyUpdateListener) {
        keyUpdateListener.onKeyUpdate(key)
    }
}
