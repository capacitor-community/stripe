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
import com.stripe.stripeterminal.external.callable.ConnectionTokenCallback;
import com.stripe.stripeterminal.external.callable.ConnectionTokenProvider;
import com.stripe.stripeterminal.external.models.ConnectionTokenException;
import org.json.JSONException;
import org.json.JSONObject;

public class TokenProvider implements ConnectionTokenProvider {

    protected Supplier<Context> contextSupplier;
    protected final String tokenProviderEndpoint;

    public TokenProvider(Supplier<Context> contextSupplier, String tokenProviderEndpoint) {
        this.contextSupplier = contextSupplier;
        this.tokenProviderEndpoint = tokenProviderEndpoint;
    }

    @Override
    public void fetchConnectionToken(ConnectionTokenCallback callback) {
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
