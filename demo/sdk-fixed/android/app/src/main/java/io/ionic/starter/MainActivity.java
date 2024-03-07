package io.ionic.starter;

import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.stripe.StripePlugin;
import com.getcapacitor.community.stripe.identity.StripeIdentityPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(StripePlugin.class);
        registerPlugin(StripeIdentityPlugin.class);
    }
}
