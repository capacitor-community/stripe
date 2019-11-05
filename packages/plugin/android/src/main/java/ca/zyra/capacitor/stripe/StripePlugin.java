package ca.zyra.capacitor.stripe;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.wallet.AutoResolveHelper;
import com.google.android.gms.wallet.IsReadyToPayRequest;
import com.google.android.gms.wallet.PaymentData;
import com.google.android.gms.wallet.PaymentDataRequest;
import com.google.android.gms.wallet.PaymentsClient;
import com.google.android.gms.wallet.Wallet;
import com.google.android.gms.wallet.WalletConstants;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.stripe.android.ApiResultCallback;
import com.stripe.android.CustomerSession;
import com.stripe.android.GooglePayConfig;
import com.stripe.android.PaymentAuthConfig;
import com.stripe.android.PaymentIntentResult;
import com.stripe.android.SetupIntentResult;
import com.stripe.android.Stripe;
import com.stripe.android.model.AccountParams;
import com.stripe.android.model.BankAccount;
import com.stripe.android.model.Card;
import com.stripe.android.model.ConfirmPaymentIntentParams;
import com.stripe.android.model.ConfirmSetupIntentParams;
import com.stripe.android.model.PaymentIntent;
import com.stripe.android.model.PaymentMethodCreateParams;
import com.stripe.android.model.SetupIntent;
import com.stripe.android.model.Source;
import com.stripe.android.model.SourceParams;
import com.stripe.android.model.Token;

import org.jetbrains.annotations.NotNull;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.List;

@NativePlugin(requestCodes = {9972, 50001})
public class StripePlugin extends Plugin {
    private Stripe stripeInstance;
    private String publishableKey;
    private static final int LOAD_PAYMENT_DATA_REQUEST_CODE = 9972;
    private boolean isTest = true;
    private PaymentData googlePayPaymentData;
    private static String TAG = "Capacitor:StripePlugin";

    @PluginMethod()
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", value);
        call.success(ret);
    }

    @PluginMethod()
    public void setPublishableKey(@NotNull PluginCall call) {
        try {
            final String key = call.getString("key");

            if (key == null || key.equals("")) {
                call.error("you must provide a valid key");
                return;
            }

            stripeInstance = new Stripe(getContext(), key);
            publishableKey = key;
            isTest = key.contains("test");

            call.success();
        } catch (Exception e) {
            call.error("unable to set publishable key: " + e.getLocalizedMessage(), e);
        }
    }

    @PluginMethod()
    public void identifyCardBrand(PluginCall call) {
        JSObject res = new JSObject();
        res.put("brand", buildCard(call).build().getBrand());
        call.success(res);
    }

    @PluginMethod()
    public void validateCardNumber(PluginCall call) {
        JSObject res = new JSObject();
        res.put("valid", buildCard(call).build().validateNumber());
        call.success(res);
    }

    @PluginMethod()
    public void validateExpiryDate(PluginCall call) {
        JSObject res = new JSObject();
        res.put("valid", buildCard(call).build().validateExpiryDate());
        call.success(res);
    }

    @PluginMethod()
    public void validateCVC(PluginCall call) {
        JSObject res = new JSObject();
        res.put("valid", buildCard(call).build().validateCVC());
        call.success(res);
    }

    @PluginMethod()
    public void createCardToken(@NotNull final PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }


        Card card = buildCard(call).build();

        if (!card.validateCard()) {
            call.error("invalid card information");
            return;
        }

        ApiResultCallback<Token> callback = new ApiResultCallback<Token>() {
            @Override
            public void onSuccess(Token token) {
                Card card = token.getCard();

                JSObject tokenJs = new JSObject();
                JSObject cardJs = cardToJSON(card);

                tokenJs.put("card", cardJs);
                tokenJs.put("id", token.getId());
                tokenJs.put("created", token.getCreated());
                tokenJs.put("type", token.getType());

                call.success(tokenJs);
            }

            @Override
            public void onError(@NotNull Exception e) {
                call.error("unable to create token: " + e.getLocalizedMessage(), e);
            }
        };

        stripeInstance.createToken(card, callback);
    }

    @PluginMethod()
    public void createBankAccountToken(final PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }


        BankAccount bankAccount = new BankAccount(
                call.getString("account_number"),
                call.getString("country"),
                call.getString("currency"),
                call.getString("routing_number")
        );

        stripeInstance.createBankAccountToken(bankAccount, new ApiResultCallback<Token>() {
            @Override
            public void onSuccess(Token token) {
                BankAccount bankAccount = token.getBankAccount();

                JSObject tokenJs = new JSObject();

                if (bankAccount != null) {
                    JSObject jsObj = bankAccountToJSON(bankAccount);
                    tokenJs.put("bankAccount", jsObj);
                }

                tokenJs.put("id", token.getId());
                tokenJs.put("created", token.getCreated());
                tokenJs.put("type", token.getType());

                call.success(tokenJs);
            }

            @Override
            public void onError(@NotNull Exception e) {
                call.error("unable to create bank account token: " + e.getLocalizedMessage(), e);
            }
        });
    }

    @PluginMethod()
    public void createSourceToken(final PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }

        SourceParams sourceParams;

        Integer sourceType = call.getInt("sourceType");
        long amount = call.getFloat("amount").longValue();
        String currency = call.getString("currency");
        String returnURL = call.getString("returnURL");
        String card = call.getString("card");
        String name = call.getString("name");
        String statementDescriptor = call.getString("statementDescriptor");
        String bank = call.getString("bank");
        String iban = call.getString("iban");
        String addressLine1 = call.getString("address_line1");
        String city = call.getString("city");
        String zip  = call.getString("address_zip");
        String country = call.getString("country");
        String email = call.getString("email");
        String callId = call.getString("callId");

        switch (sourceType) {
            case 0:
                sourceParams = SourceParams.createThreeDSecureParams(amount, currency, returnURL, card);
                break;

            case 1:
                sourceParams = SourceParams.createGiropayParams(amount, name, returnURL, statementDescriptor);
                break;

            case 2:
                sourceParams = SourceParams.createIdealParams(amount, name, returnURL, statementDescriptor, bank);
                break;

            case 3:
                sourceParams = SourceParams.createSepaDebitParams(name, iban, addressLine1, city, zip, country);
                break;

            case 4:
                sourceParams = SourceParams.createSofortParams(amount, returnURL, country, statementDescriptor);
                break;

            case 5:
                sourceParams = SourceParams.createAlipaySingleUseParams(amount, currency, name, email, returnURL);
                break;

            case 6:
                sourceParams = SourceParams.createAlipayReusableParams(currency, name, email, returnURL);
                break;

            case 7:
                sourceParams = SourceParams.createP24Params(amount, currency, name, email, returnURL);
                break;

            case 8:
                sourceParams = SourceParams.createVisaCheckoutParams(callId);
                break;

            default:
                return;
        }

        stripeInstance.createSource(sourceParams, new ApiResultCallback<Source>() {
            @Override
            public void onSuccess(Source source) {
                JSObject tokenJs = new JSObject();
                tokenJs.put("id", source.getId());
                tokenJs.put("created", source.getCreated());
                tokenJs.put("type", source.getType());
                call.success(tokenJs);
            }

            @Override
            public void onError(@NotNull Exception e) {
                call.error("unable to create source token: " + e.getLocalizedMessage(), e);
            }
        });
    }

    @PluginMethod()
    public void createAccountToken(final PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }


        final JSObject legalEntity = call.getObject("legalEntity");
        final String businessType = call.getString("businessType");
        final Boolean tosShownAndAccepted = call.getBoolean("tosShownAndAccepted");
        AccountParams.BusinessType bt = businessType.equals("company") ? AccountParams.BusinessType.Company : AccountParams.BusinessType.Individual;
        AccountParams params = AccountParams.createAccountParams(tosShownAndAccepted, bt, jsonToHashMap(legalEntity));

        stripeInstance.createAccountToken(params, new ApiResultCallback<Token>() {
            @Override
            public void onSuccess(Token token) {
                JSObject res = new JSObject();
                res.put("token", token.getId());
                call.success(res);
            }

            @Override
            public void onError(@NotNull Exception e) {
                call.error("unable to create account token: " + e.getLocalizedMessage(), e);
            }
        });
    }

    @PluginMethod()
    public void createPiiToken(final PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }


        String pii = call.getString("pii");
        stripeInstance.createPiiToken(pii, new ApiResultCallback<Token>() {
            @Override
            public void onSuccess(Token token) {
                JSObject res = new JSObject();
                res.put("token", token.getId());
                call.success(res);
            }

            @Override
            public void onError(@NotNull Exception e) {
                call.error("unable to create pii token: " + e.getLocalizedMessage(), e);
            }
        });
    }

    @PluginMethod()
    public void confirmPaymentIntent(PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }


        final String clientSecret = call.getString("clientSecret");
        final Boolean saveMethod = call.getBoolean("saveMethod");
        final String redirectUrl = call.getString("redirectUrl");

        ConfirmPaymentIntentParams params;

        if (call.hasOption("card")) {
            Card.Builder cb = buildCard(call); // TODO fix this, we need to pass call.getObject(card)xs
            PaymentMethodCreateParams.Card cardParams = cb.build().toPaymentMethodParamsCard();
            PaymentMethodCreateParams pmCreateParams = PaymentMethodCreateParams.create(cardParams);
            params = ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(pmCreateParams, clientSecret, redirectUrl, saveMethod);
        } else if (call.hasOption("paymentMethodId")) {
            params = ConfirmPaymentIntentParams.createWithPaymentMethodId(call.getString("paymentMethodId"), clientSecret, redirectUrl, saveMethod);
        } else if (call.hasOption("sourceId")) {
            params = ConfirmPaymentIntentParams.createWithSourceId(call.getString("sourceId"), clientSecret, redirectUrl, saveMethod);
        } else if (call.getBoolean("fromGooglePay", false)) {
            try {
                final String js = googlePayPaymentData.toJson();
                final JSONObject gpayObj = new JSObject(js);

                googlePayPaymentData = null;

                PaymentMethodCreateParams pmcp = PaymentMethodCreateParams.createFromGooglePay(gpayObj);
                params = ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(pmcp, clientSecret, redirectUrl, saveMethod);
            } catch (JSONException e) {
                call.error("unable to parse json: " + e.getLocalizedMessage(), e);
                return;
            }
        } else {
            params = ConfirmPaymentIntentParams.create(clientSecret, redirectUrl);
        }

        stripeInstance.confirmPayment(getActivity(), params);
        saveCall(call);
    }

    @PluginMethod()
    public void confirmSetupIntent(PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }


        final String clientSecret = call.getString("clientSecret");
        final String redirectUrl = call.getString("redirectUrl");

        ConfirmSetupIntentParams params;

        if (call.hasOption("card")) {
            Card.Builder cb = buildCard(call);
            PaymentMethodCreateParams.Card cardParams = cb.build().toPaymentMethodParamsCard();
            PaymentMethodCreateParams pmCreateParams = PaymentMethodCreateParams.create(cardParams);
            params = ConfirmSetupIntentParams.create(pmCreateParams, clientSecret, redirectUrl);
        } else if (call.hasOption("paymentMethodId")) {
            params = ConfirmSetupIntentParams.create(call.getString("paymentMethodId"), clientSecret, redirectUrl);
        } else {
            params = ConfirmSetupIntentParams.createWithoutPaymentMethod(clientSecret, redirectUrl);
        }

        stripeInstance.confirmSetupIntent(getActivity(), params);
        saveCall(call);
    }

    @PluginMethod()
    public void customizePaymentAuthUI(@NotNull PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }


        final PaymentAuthConfig.Stripe3ds2UiCustomization.Builder builder = new PaymentAuthConfig.Stripe3ds2UiCustomization.Builder();

        // TODO add the remaining options here

        String accentColor = call.getString("accentColor");

        if (accentColor != null) {
            builder.setAccentColor(accentColor);
        }

        JSArray btnOpts = call.getArray("buttonCustomizations");

        if (btnOpts != null) {
            try {
                List<JSObject> opts = btnOpts.toList();
                String buttonType;
                String backgroundColor;
                String textColor;
                String fontName;
                Integer cornerRadius;
                Integer fontSize;
                PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType stripeBtnType;
                PaymentAuthConfig.Stripe3ds2ButtonCustomization.Builder btnOptsBuilder;
                PaymentAuthConfig.Stripe3ds2ButtonCustomization stripeBtnOpts;

                for (JSObject opt : opts) {
                    buttonType = opt.getString("type");
                    backgroundColor = opt.getString("backgroundColor");
                    textColor = opt.getString("textColor");
                    fontName = opt.getString("fontName");
                    cornerRadius = opt.getInteger("cornerRadius");
                    fontSize = opt.getInteger("fontSize");

                    switch (buttonType) {
                        case "submit":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.SUBMIT;
                            break;

                        case "continue":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.CONTINUE;
                            break;

                        case "next":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.NEXT;
                            break;

                        case "cancel":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.CANCEL;
                            break;

                        case "resend":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.RESEND;
                            break;

                        case "select":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.SELECT;
                            break;

                        default:
                            continue;
                    }

                    btnOptsBuilder = new PaymentAuthConfig.Stripe3ds2ButtonCustomization.Builder();

                    if (backgroundColor != null) {
                        btnOptsBuilder.setBackgroundColor(backgroundColor);
                    }

                    if (cornerRadius != null) {
                        btnOptsBuilder.setCornerRadius(cornerRadius);
                    }

                    if (textColor != null) {
                        btnOptsBuilder.setTextColor(textColor);
                    }

                    if (fontName != null) {
                        btnOptsBuilder.setTextFontName(fontName);
                    }

                    if (fontSize != null) {
                        btnOptsBuilder.setTextFontSize(fontSize);
                    }

                    stripeBtnOpts = btnOptsBuilder.build();

                    builder.setButtonCustomization(stripeBtnOpts, stripeBtnType);
                }
            } catch (Exception e) {
                //
            }
        }


        final PaymentAuthConfig.Stripe3ds2UiCustomization uiCustomization = builder.build();

        PaymentAuthConfig.init(new PaymentAuthConfig.Builder()
                .set3ds2Config(new PaymentAuthConfig.Stripe3ds2Config.Builder()
                        .setTimeout(5)
                        .setUiCustomization(uiCustomization)
                        .build())
                .build());
    }

    @PluginMethod()
    public void isGooglePayAvailable(final PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }


        PaymentsClient paymentsClient = Wallet.getPaymentsClient(
                getContext(),
                new Wallet.WalletOptions
                        .Builder()
                        .setEnvironment(isTest ? WalletConstants.ENVIRONMENT_TEST : WalletConstants.ENVIRONMENT_PRODUCTION)
                        .build()
        );

        final JSArray allowedAuthMethods = new JSArray();
        allowedAuthMethods.put("PAN_ONLY");
        allowedAuthMethods.put("CRYPTOGRAM_3DS");

        final JSArray allowedCardNetworks = new JSArray();
        allowedCardNetworks.put("AMEX");
        allowedCardNetworks.put("DISCOVER");
        allowedCardNetworks.put("JCB");
        allowedCardNetworks.put("MASTERCARD");
        allowedCardNetworks.put("VISA");

        final JSObject isReadyToPayRequestJson = new JSObject();
        isReadyToPayRequestJson.put("allowedAuthMethods", allowedAuthMethods);
        isReadyToPayRequestJson.put("allowedCardNetworks", allowedCardNetworks);

        IsReadyToPayRequest req = IsReadyToPayRequest.fromJson(isReadyToPayRequestJson.toString());
        paymentsClient.isReadyToPay(req)
                .addOnCompleteListener(new OnCompleteListener<Boolean>() {
                    @Override
                    public void onComplete(@NotNull Task<Boolean> task) {
                        JSObject obj = new JSObject();
                        obj.put("available", task.isSuccessful());
                        call.resolve(obj);
                    }
                });
    }

    @PluginMethod()
    public void startGooglePayTransaction(final PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }


        final boolean isTest = this.isTest;
        final int env = isTest ? WalletConstants.ENVIRONMENT_TEST : WalletConstants.ENVIRONMENT_PRODUCTION;

        Log.d(TAG, "startGooglePayTransaction | isTest: " + (isTest ? "TRUE" : "FALSE") + " | env: " + (env == WalletConstants.ENVIRONMENT_TEST ? "TEST" : "PROD"));

        PaymentsClient paymentsClient = Wallet.getPaymentsClient(
                getContext(),
                new Wallet.WalletOptions
                        .Builder()
                        .setEnvironment(env)
                        .build()
        );

        try {
            // PAN_ONLY, CRYPTOGRAM_3DS
            final JSArray defaultAuthMethods = new JSArray();
            defaultAuthMethods.put("PAN_ONLY");
            defaultAuthMethods.put("CRYPTOGRAM_3DS");

            final JSArray defaultCardNetworks = new JSArray();
            defaultCardNetworks.put("AMEX");
            defaultCardNetworks.put("DISCOVER");
            defaultCardNetworks.put("JCB");
            defaultCardNetworks.put("MASTERCARD");
            defaultCardNetworks.put("VISA");

            final String totalPrice = call.getString("totalPrice");
            final String totalPriceStatus = call.getString("totalPriceStatus");
            final String currencyCode = call.getString("currencyCode");
            final String merchantName = call.getString("merchantName");

            final Boolean emailRequired = call.getBoolean("emailRequired", false);
            final Boolean billingAddressRequired = call.getBoolean("billingAddressRequired", false);
            final Boolean allowPrepaidCards = call.getBoolean("allowPrepaidCards", true);
            final Boolean shippingAddressRequired = call.getBoolean("shippingAddressRequired", false);

            final JSArray authMethods = call.getArray("allowedAuthMethods", defaultAuthMethods);
            final JSArray cardNetworks = call.getArray("allowedCardNetworks", defaultCardNetworks);

            final JSObject billingAddressParams = call.getObject("billingAddressParams", new JSObject());

            if (!billingAddressParams.has("format")) {
                billingAddressParams.put("format", "MIN");
            }

            if (!billingAddressParams.has("phoneNumberRequired")) {
                billingAddressParams.put("phoneNumberRequired", false);
            }

            final JSObject shippingAddressParams = call.getObject("shippingAddressParameters", new JSObject());

            final JSObject params = new JSObject()
                    .put("allowedAuthMethods", authMethods)
                    .put("allowedCardNetworks", cardNetworks)
                    .put("billingAddressRequired", billingAddressRequired)
                    .put("allowPrepaidCards", allowPrepaidCards)
                    .put("billingAddressParameters", billingAddressParams);

            final JSONObject tokenizationSpec = new GooglePayConfig(publishableKey).getTokenizationSpecification();

            final JSObject cardPaymentMethod = new JSObject()
                    .put("type", "CARD")
                    .put("parameters", params)
                    .put("tokenizationSpecification", tokenizationSpec);

            final JSObject txInfo = new JSObject();
            txInfo.put("totalPrice", totalPrice);
            txInfo.put("totalPriceStatus", totalPriceStatus);
            txInfo.put("currencyCode", currencyCode);

            final JSObject paymentDataReq = new JSObject()
                    .put("apiVersion", 2)
                    .put("apiVersionMinor", 0)
                    .put("allowedPaymentMethods", new JSArray().put(cardPaymentMethod))
                    .put("transactionInfo", txInfo)
                    .put("emailRequired", emailRequired);

            if (merchantName != null) {
                paymentDataReq.put("merchantInfo", new JSObject().put("merchantName", merchantName));
            }

            if (shippingAddressRequired) {
                paymentDataReq.put("shippingAddressRequired", true);
                paymentDataReq.put("shippingAddressParameters", shippingAddressParams);
            }

            final String paymentDataReqStr = paymentDataReq.toString();

            Log.d(TAG, "payment data is: " + paymentDataReqStr);

            PaymentDataRequest req = PaymentDataRequest.fromJson(paymentDataReqStr);

            AutoResolveHelper.resolveTask(
                    paymentsClient.loadPaymentData(req),
                    getActivity(),
                    LOAD_PAYMENT_DATA_REQUEST_CODE
            );

            saveCall(call);
        } catch (JSONException e) {
            call.error("json parsing error: " + e.getLocalizedMessage(), e);
        }
    }

    @PluginMethod()
    public void initCustomerSession(PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }

        String ephKey = call.getString("key");
        EphKeyProvider.setKey(ephKey);
        CustomerSession.initCustomerSession(getContext(), new EphKeyProvider());
        call.resolve();
    }

    @PluginMethod()
    public void onPaymentSessionDataChanged(PluginCall call) {
        if (!ensurePluginInitialized(call)) {
            return;
        }

        call.save();
    }

    /**
     * Ensures that setPublishableKey was called and stripeInstance exists.
     * Rejects the call with an error and returns false if the plugin is not ready.
     *
     * @param call {PluginCall} current method call
     * @return {boolean} returns true if the plugin is ready
     */
    private boolean ensurePluginInitialized(final PluginCall call) {
        if (stripeInstance == null) {
            call.error("you must call setPublishableKey to initialize the plugin before calling this method");
            return false;
        }

        return true;
    }

    private void handleGooglePayActivityResult(@NonNull int resultCode, Intent data) {
        Log.v(TAG, "handleGooglePayActivityResult called with resultCode: " + resultCode);
        final PluginCall googlePayCall = getSavedCall();

        if (googlePayCall == null) {
            Log.e(TAG, "no saved PluginCall was found");
            return;
        }

        switch (resultCode) {
            case Activity.RESULT_OK: {
                if (data == null) {
                    googlePayCall.error("an unexpected error occurred");
                    Log.e(TAG, "data is null");
                    break;
                }

                PaymentData paymentData = PaymentData.getFromIntent(data);

                if (paymentData == null) {
                    Log.e(TAG, "paymentData is null");
                    googlePayCall.error("an unexpected error occurred");
                    break;
                }

                googlePayPaymentData = paymentData;

                googlePayCall.resolve();
                break;
            }

            case Activity.RESULT_CANCELED:
            case AutoResolveHelper.RESULT_ERROR:
                final Status status = AutoResolveHelper.getStatusFromIntent(data);
                JSObject obj = new JSObject();

                if (status != null) {
                    obj.put("canceled", status.isCanceled());
                    obj.put("interrupted", status.isInterrupted());
                    obj.put("success", status.isSuccess());
                    obj.put("code", status.getStatusCode());
                    obj.put("message", status.getStatusMessage());
                    obj.put("resolution", status.getResolution());
                } else {
                    obj.put("canceled", true);
                }

                googlePayCall.resolve(obj);
                break;
        }


        freeSavedCall();
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);

        Log.d(TAG, "handleOnActivityResult called with request code: " + requestCode + " and resultCode: " + resultCode);

        if (requestCode == LOAD_PAYMENT_DATA_REQUEST_CODE) {
            Log.d(TAG, "requestCode matches GooglePay, forwarding data to handleGooglePayActivityResult");
            handleGooglePayActivityResult(resultCode, data);
            return;
        }

        final PluginCall call = getSavedCall();

        if (call == null) {
            Log.d(TAG, "could not find a saved PluginCall, discarding activity result");
            return;
        }

        Log.d(TAG, "passing activity result to stripe");

        stripeInstance.onPaymentResult(requestCode, data, new ApiResultCallback<PaymentIntentResult>() {
            @Override
            public void onSuccess(PaymentIntentResult paymentIntentResult) {
                Log.d(TAG, "onPaymentResult.onSuccess called");
                PaymentIntent pi = paymentIntentResult.getIntent();
                JSObject res = paymentIntentToJSON(pi);
                call.success(res);
                freeSavedCall();
            }

            @Override
            public void onError(@NotNull Exception e) {
                Log.d(TAG, "onPaymentResult.onError called");
                call.error("unable to complete transaction: " + e.getLocalizedMessage(), e);
                freeSavedCall();
            }
        });

        stripeInstance.onSetupResult(requestCode, data, new ApiResultCallback<SetupIntentResult>() {
            @Override
            public void onSuccess(SetupIntentResult setupIntentResult) {
                Log.d(TAG, "onSetupResult.onSuccess called");
                SetupIntent si = setupIntentResult.getIntent();
                JSObject res = setupIntentToJSON(si);
                call.success(res);
                freeSavedCall();
            }

            @Override
            public void onError(@NotNull Exception e) {
                Log.d(TAG, "onSetupResult.onError called");
                call.error("unable to complete transaction: " + e.getLocalizedMessage(), e);
                freeSavedCall();
            }
        });
    }

    private static Card.Builder buildCard(final PluginCall call) {
        final Card.Builder builder = new Card.Builder(
                call.getString("number"),
                call.getInt("exp_month"),
                call.getInt("exp_year"),
                call.getString("cvc")
        );

        return builder
                .name(call.getString("value"))
                .addressLine1(call.getString("address_line1"))
                .addressLine2(call.getString("address_line2"))
                .addressCity(call.getString("address_city"))
                .addressState(call.getString("address_state"))
                .addressZip(call.getString("address_zip"))
                .country(call.getString("address_country"))
                .currency(call.getString("currency"));
    }

    private static JSObject cardToJSON(Card card) {
        JSObject cardJs = new JSObject();
        cardJs.put("address_city", card.getAddressCity());
        cardJs.put("address_country", card.getAddressCountry());
        cardJs.put("address_state", card.getAddressState());
        cardJs.put("address_line1", card.getAddressLine1());
        cardJs.put("address_line2", card.getAddressLine2());
        cardJs.put("address_zip", card.getAddressZip());
        cardJs.put("brand", card.getBrand());
        cardJs.put("country", card.getAddressCountry());
        cardJs.put("cvc", card.getCvc());
        cardJs.put("exp_month", card.getExpMonth());
        cardJs.put("exp_year", card.getExpYear());
        cardJs.put("funding", card.getFunding());
        cardJs.put("last4", card.getLast4());
        cardJs.put("name", card.getName());
        return cardJs;
    }

    private static JSObject bankAccountToJSON(BankAccount account) {
        JSObject bankObject = new JSObject();

        bankObject.put("account_holder_name", account.getAccountHolderName());
        bankObject.put("account_holder_type", account.getAccountHolderType());
        bankObject.put("bank_name", account.getBankName());
        bankObject.put("country", account.getCountryCode());
        bankObject.put("currency", account.getCurrency());
        bankObject.put("last4", account.getLast4());
        bankObject.put("routing_number", account.getRoutingNumber());

        return bankObject;
    }

    private static JSObject setupIntentToJSON(@NonNull final SetupIntent si) {
        final JSObject res = new JSObject();

        res.put("status", si.getStatus());
        res.put("paymentMethodId", si.getPaymentMethodId());
        res.put("cancellationReason", si.getCancellationReason());
        res.put("created", si.getCreated());
        res.put("description", si.getDescription());
        res.put("id", si.getId());
        res.put("isLiveMode", si.isLiveMode());

        final SetupIntent.Usage u = si.getUsage();

        if (u != null) {
            res.put("usage", u.getCode());
        }

        return res;
    }

    private static JSObject paymentIntentToJSON(@NonNull final PaymentIntent pi) {
        final JSObject res = new JSObject();
        final PaymentIntent.Status status = pi.getStatus();

        res.put("status", status);
        res.put("amount", pi.getAmount());
        res.put("canceledAt", pi.getCanceledAt());
        res.put("cancellationReason", pi.getCancellationReason());
        res.put("captureMethod", pi.getCaptureMethod());
        res.put("confirmationMethod", pi.getConfirmationMethod());
        res.put("created", pi.getCreated());
        res.put("currency", pi.getCurrency());
        res.put("description", pi.getDescription());
        res.put("id", pi.getId());
        res.put("lastPaymentError", pi.getLastPaymentError());
        res.put("paymentMethodId", pi.getPaymentMethodId());
        res.put("isLiveMode", pi.isLiveMode());

        // TODO confirm whether we really need to check this since the SDK handles action/confirmation automatically
        res.put("success", status == PaymentIntent.Status.Succeeded);
        res.put("requiresAction", pi.requiresAction());
        res.put("requiresConfirmation", pi.requiresConfirmation());

        return res;
    }

    private static HashMap<String, Object> jsonToHashMap(final JSONObject obj) {
        if (obj != null && obj.length() > 0) {
            final Type type = new TypeToken<HashMap<String, Object>>() {
            }.getType();
            return new Gson().fromJson(obj.toString(), type);
        } else {
            return new HashMap<>();
        }
    }
}
