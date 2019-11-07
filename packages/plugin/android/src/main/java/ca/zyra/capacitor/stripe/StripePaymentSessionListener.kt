package ca.zyra.capacitor.stripe

import android.util.Log
import com.stripe.android.CustomerSession
import com.stripe.android.PaymentSession
import com.stripe.android.PaymentSessionData
import com.stripe.android.StripeError
import com.stripe.android.model.PaymentMethod

internal class StripePaymentSessionListener : PaymentSession.PaymentSessionListener {
    override fun onError(errorCode: Int, errorMessage: String) {
        Log.v("PaymentSessionListener", "onError")
    }

    override fun onPaymentSessionDataChanged(data: PaymentSessionData) {
        Log.v("PaymentSessionListener", "onPaymentSessionDataChanged")
    }

    override fun onCommunicatingStateChanged(isCommunicating: Boolean) {
        Log.v("PaymentSessionListener", "onCommunicatingStateChanged")
    }
}

