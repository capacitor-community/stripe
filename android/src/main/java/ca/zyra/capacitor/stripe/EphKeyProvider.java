package ca.zyra.capacitor.stripe;

import com.stripe.android.EphemeralKeyProvider;
import com.stripe.android.EphemeralKeyUpdateListener;

import org.jetbrains.annotations.NotNull;

class EphKeyProvider implements EphemeralKeyProvider {
    private static String key;

    public static void setKey(String key) {
        EphKeyProvider.key = key;
    }

    @Override
    public void createEphemeralKey(@NotNull String s, @NotNull EphemeralKeyUpdateListener ephemeralKeyUpdateListener) {
        ephemeralKeyUpdateListener.onKeyUpdate(EphKeyProvider.key);
    }
}
