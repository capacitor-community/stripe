package com.getcapacitor.community.stripe.paymentflow

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PaymentOptionResultTest {
    @Test
    fun completedPaymentOptionResetIsIgnored() {
        assertTrue(shouldIgnorePaymentOptionResult(hasPaymentOption = false, didCancel = false))
    }

    @Test
    fun canceledPaymentOptionIsNotIgnored() {
        assertFalse(shouldIgnorePaymentOptionResult(hasPaymentOption = false, didCancel = true))
    }

    @Test
    fun selectedPaymentOptionIsNotIgnored() {
        assertFalse(shouldIgnorePaymentOptionResult(hasPaymentOption = true, didCancel = false))
    }
}
