package ca.zyra.capacitor.stripe

import com.google.android.gms.wallet.PaymentData
import com.stripe.android.CustomerSession
import com.stripe.android.StripeError
import com.stripe.android.model.PaymentMethod

internal abstract class PaymentMethodsCallback {
    abstract fun onSuccess(paymentMethods: List<PaymentMethod>)
    abstract fun onError(err: Exception)
}

internal abstract class GooglePayCallback {
    abstract fun onSuccess(res: PaymentData)
    abstract fun onError(err: Exception)
}

internal class StripePaymentMethodsListener(private val callback: PaymentMethodsCallback) : CustomerSession.PaymentMethodsRetrievalListener {
    override fun onError(errorCode: Int, errorMessage: String, stripeError: StripeError?) {
        callback.onError(Exception(errorMessage))
    }

    override fun onPaymentMethodsRetrieved(paymentMethods: List<PaymentMethod>) {
        callback.onSuccess(paymentMethods)
    }
}

