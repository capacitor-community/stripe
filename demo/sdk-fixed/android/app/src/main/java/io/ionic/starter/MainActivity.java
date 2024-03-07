package io.ionic.starter;

import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.stripe.StripePlugin;
import com.getcapacitor.community.stripe.identity.StripeIdentityPlugin;
import com.getcapacitor.community.stripe.terminal.StripeTerminalPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(StripePlugin.class);
        registerPlugin(StripeIdentityPlugin.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
          registerPlugin(StripeTerminalPlugin.class);
        }
    }
}
