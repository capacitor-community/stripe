package com.getcapacitor.community.stripe.terminal;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "StripeTerminal")
public class StripeTerminalPlugin extends Plugin {

    private StripeTerminal implementation = new StripeTerminal();

    @Override
    public void load() {
	    if (ContextCompat.checkSelfPermission(getActivity(),
	      Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
	        String[] permissions = {Manifest.permission.ACCESS_FINE_LOCATION};
	        // REQUEST_CODE_LOCATION should be defined on your app level
	        ActivityCompat.requestPermissions(getActivity(), permissions, REQUEST_CODE_LOCATION);
	    }
    }

    @Override
    public void onRequestPermissionsResult(
      int requestCode,
      @NonNull String[] permissions,
      @NonNull int[] grantResults
    ) {
      super.onRequestPermissionsResult(requestCode, permissions, grantResults);

      if (requestCode == REQUEST_CODE_LOCATION && grantResults.length > 0
          && grantResults[0] != PackageManager.PERMISSION_GRANTED) {
        throw new RuntimeException("Location services are required in order to " +
                    "connect to a reader.");
      }
    }

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", implementation.echo(value));
        call.resolve(ret);
    }
}
