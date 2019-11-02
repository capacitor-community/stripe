package ca.zyra.capacitor.stripe;

import android.content.Intent;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.google.android.gms.wallet.PaymentMethodTokenizationParameters;
import com.google.android.gms.wallet.PaymentsClient;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.stripe.android.ApiResultCallback;
import com.stripe.android.PaymentAuthConfig;
import com.stripe.android.PaymentIntentResult;
import com.stripe.android.Stripe;
import com.stripe.android.model.AccountParams;
import com.stripe.android.model.BankAccount;
import com.stripe.android.model.Card;
import com.stripe.android.model.ConfirmPaymentIntentParams;
import com.stripe.android.model.ConfirmSetupIntentParams;
import com.stripe.android.model.PaymentIntent;
import com.stripe.android.model.PaymentMethodCreateParams;
import com.stripe.android.model.Source;
import com.stripe.android.model.SourceParams;
import com.stripe.android.model.Token;

import org.jetbrains.annotations.NotNull;
import org.json.JSONObject;

import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.List;

@NativePlugin()
public class StripePlugin extends Plugin {
    private Stripe stripeInstance;
    private String publishableKey;
    private PaymentsClient paymentsClient;
    private boolean googlePayReady;
    private PaymentMethodTokenizationParameters googlePayParams;
    private final int LOAD_PAYMENT_DATA_REQUEST_CODE = 9972;
    //    private CallbackContext googlePayCallbackContext;
    private boolean isTest = true;
    private PluginCall intentCall;

    @PluginMethod()
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", value);
        call.success(ret);
    }

    @PluginMethod()
    public void setPublishableKey(@NotNull PluginCall call) {
        final String key = call.getString("key");

        if (key.equals("")) {
            call.error("you must provide a valid key");
            return;
        }

        stripeInstance = new Stripe(getContext(), key);
        publishableKey = key;
        isTest = key.contains("test");
    }

    @PluginMethod()
    public void identifyCardBrand(PluginCall call) {
        Card card = Card.create(call.getString("number"), null, null, null);
        JSObject res = new JSObject();
        res.put("brand", card.getBrand());
        call.success(res);
    }

    @PluginMethod()
    public void validateCardNumber(PluginCall call) {
        Card card = Card.create(call.getString("number"), null, null, null);
        JSObject res = new JSObject();
        res.put("valid", card.validateNumber());
        call.success(res);
    }

    @PluginMethod()
    public void validateExpiryDate(PluginCall call) {
        Card card = Card.create(null, call.getInt("expMonth"), call.getInt("expYear"), null);
        JSObject res = new JSObject();
        res.put("valid", card.validateExpiryDate());
        call.success(res);
    }

    @PluginMethod()
    public void createCardToken(@NotNull final PluginCall call) {
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
                call.error("unable to create token", e);
            }
        };

        stripeInstance.createToken(card, callback);
    }

    @PluginMethod()
    public void createBankAccountToken(final PluginCall call) {
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
                JSObject jsObj = bankAccountToJSON(bankAccount);

                tokenJs.put("bankAccount", jsObj);
                tokenJs.put("id", token.getId());
                tokenJs.put("created", token.getCreated());
                tokenJs.put("type", token.getType());

                call.success(tokenJs);
            }

            @Override
            public void onError(@NotNull Exception e) {
                call.error("unable to create bank account token", e);
            }
        });
    }

    @PluginMethod()
    public void createSourceToken(final PluginCall call) {
        SourceParams sourceParams;

        Integer sourceType = call.getInt("sourceType");
        Long amount = call.getFloat("amount").longValue();
        String currency = call.getString("currency");
        String returnURL = call.getString("returnURL");
        String card = call.getString("card");
        String name = call.getString("name");
        String statementDescriptor = call.getString("statementDescriptor");
        String bank = call.getString("bank");
        String iban = call.getString("iban");
        String addressLine1 = call.getString("addressLine1");
        String city = call.getString("city");
        String postalCode = call.getString("postalCode");
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
                sourceParams = SourceParams.createSepaDebitParams(name, iban, addressLine1, city, postalCode, country);
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
                call.error("unable to create source token", e);
            }
        });
    }

    @PluginMethod()
    public void createAccountToken(final PluginCall call) {
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
                call.error("unable to create account token", e);
            }
        });
    }

    @PluginMethod()
    public void createPiiToken(final PluginCall call) {
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
                call.error("unable to create pii token", e);
            }
        });
    }

    @PluginMethod()
    public void confirmPaymentIntent(PluginCall call) {
        final String clientSecret = call.getString("clientSecret");
        final Boolean saveMethod = call.getBoolean("saveMethod");
        final String redirectUrl = call.getString("redirectUrl");

        ConfirmPaymentIntentParams params;

        if (call.hasOption("card")) {
            Card.Builder cb = buildCard(call);
            PaymentMethodCreateParams.Card cardParams = cb.build().toPaymentMethodParamsCard();
            PaymentMethodCreateParams pmCreateParams = PaymentMethodCreateParams.create(cardParams);
            params = ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(pmCreateParams, clientSecret, redirectUrl, saveMethod);
        } else if (call.hasOption("paymentMethodId")) {
            params = ConfirmPaymentIntentParams.createWithPaymentMethodId(call.getString("paymentMethodId"), clientSecret, redirectUrl, saveMethod);
        } else if (call.hasOption("sourceId")) {
            params = ConfirmPaymentIntentParams.createWithSourceId(call.getString("sourceId"), clientSecret, redirectUrl, saveMethod);
        } else {
            params = ConfirmPaymentIntentParams.create(clientSecret, redirectUrl);
        }

        stripeInstance.confirmPayment(getActivity(), params);

        call.success();
    }

    @PluginMethod()
    public void confirmSetupIntent(PluginCall call) {
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

        call.success();
    }

    @PluginMethod()
    public void customizePaymentAuthUI(@NotNull PluginCall call) {
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

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);

        final PluginCall call = intentCall; // TODO get saved call from other methods

        if (call == null) {
            return;
        }

        stripeInstance.onPaymentResult(requestCode, data, new ApiResultCallback<PaymentIntentResult>() {
            @Override
            public void onSuccess(PaymentIntentResult paymentIntentResult) {
                PaymentIntent pi = paymentIntentResult.getIntent();
                JSObject res = paymentIntentToJSON(pi);
                call.success(res);
            }

            @Override
            public void onError(@NotNull Exception e) {
                call.error("unable to complete transaction", e);
            }
        });
    }

    private static Card.Builder buildCard(final PluginCall call) {
        return Card
                .create(
                        call.getString("number"),
                        call.getInt("expMonth"),
                        call.getInt("expYear"),
                        call.getString("cvc")
                )
                .toBuilder()
                .name(call.getString("value"))
                .addressLine1(call.getString("address_line1"))
                .addressLine2(call.getString("address_line2"))
                .addressCity(call.getString("address_city"))
                .addressState(call.getString("address_state"))
                .addressZip(call.getString("postalCode"))
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

    private static JSObject paymentIntentToJSON(PaymentIntent pi) {
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
            return new HashMap<String, Object>();
        }
    }
}
