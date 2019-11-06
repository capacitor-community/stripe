package ca.zyra.capacitor.stripe

import android.util.Log
import com.stripe.android.PaymentSession
import com.stripe.android.PaymentSessionData

class StripeListener : PaymentSession.PaymentSessionListener {
    override fun onError(errorCode: Int, errorMessage: String) {
        Log.v("StripeListener", "onError")
    }

    override fun onPaymentSessionDataChanged(data: PaymentSessionData) {
        Log.v("StripeListener", "onPaymentSessionDataChanged")
    }

    override fun onCommunicatingStateChanged(isCommunicating: Boolean) {
        Log.v("StripeListener", "onCommunicatingStateChanged")
    }
}
