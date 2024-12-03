package com.getcapacitor.community.stripe.terminal;

import android.content.Context;
import android.util.Log;
import androidx.core.util.Supplier;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.stripeterminal.external.callable.ConnectionTokenCallback;
import com.stripe.stripeterminal.external.callable.ConnectionTokenProvider;
import com.stripe.stripeterminal.external.models.ConnectionTokenException;

import java.util.ArrayList;
import java.util.Objects;
import org.json.JSONException;
import org.json.JSONObject;

public class TokenProvider implements ConnectionTokenProvider {

    protected Supplier<Context> contextSupplier;
    protected final String tokenProviderEndpoint;
    protected BiConsumer<String, JSObject> notifyListenersFunction;
    ArrayList<ConnectionTokenCallback> pendingCallback = new ArrayList<>();

    public TokenProvider(
        Supplier<Context> contextSupplier,
        String tokenProviderEndpoint,
        BiConsumer<String, JSObject> notifyListenersFunction
    ) {
        this.contextSupplier = contextSupplier;
        this.tokenProviderEndpoint = tokenProviderEndpoint;
        this.notifyListenersFunction = notifyListenersFunction;
    }

    public void setConnectionToken(PluginCall call) {
        String token = call.getString("token", "");
        if (!pendingCallback.isEmpty()) {
            ConnectionTokenCallback pending = pendingCallback.remove(0);
            if (Objects.equals(token, "")) {
                pending.onFailure(new ConnectionTokenException("Missing `token` is empty"));
                call.reject("Missing `token` is empty");
            } else {
                pending.onSuccess(token);
                call.resolve();
            }
            pendingCallback = null;
        } else {
            call.reject("Stripe Terminal do not pending fetchConnectionToken");
        }
    }

    @Override
    public void fetchConnectionToken(ConnectionTokenCallback callback) {
        if (Objects.equals(this.tokenProviderEndpoint, "")) {
            pendingCallback.add(callback);
            this.notifyListeners(TerminalEnumEvent.RequestedConnectionToken.getWebEventName(), new JSObject());
        } else {
            try {
                RequestQueue queue = Volley.newRequestQueue(this.contextSupplier.get());
                StringRequest postRequest = new StringRequest(
                    Request.Method.POST,
                    this.tokenProviderEndpoint,
                    new Response.Listener<String>() {
                        @Override
                        public void onResponse(String response) {
                            try {
                                JSONObject jsonObject = new JSONObject(response);
                                Log.d("TokenProvider", jsonObject.getString("secret"));
                                callback.onSuccess(jsonObject.getString("secret"));
                            } catch (JSONException e) {
                                callback.onFailure(new ConnectionTokenException(Objects.requireNonNull(e.getLocalizedMessage())));
                                throw new RuntimeException(e);
                            }
                        }
                    },
                    new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError e) {
                            throw new RuntimeException(e);
                        }
                    }
                ) {
                    //                @Override
                    //                protected Map<String,String> getParams(){
                    //                    Map<String,String> params = new HashMap<>();
                    //                    params.put("word","test");
                    //                    return params;
                    //                }
                };

                queue.add(postRequest);
            } catch (Exception e) {
                callback.onFailure(new ConnectionTokenException("Failed to fetch connection token", e));
            }
        }
    }

    protected void notifyListeners(String eventName, JSObject data) {
        notifyListenersFunction.accept(eventName, data);
    }
}
