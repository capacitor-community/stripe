import StripePaymentSheet

class PaymentSheetHelper {
    func getCollectionModeValue(mode: String) -> PaymentSheet.BillingDetailsCollectionConfiguration.CollectionMode {
        switch mode {
        case "always":
            return .always
        case "never":
            return .never
        default:
            return .automatic
        }
    }

    func getAddressCollectionModeValue(mode: String) -> PaymentSheet.BillingDetailsCollectionConfiguration.AddressCollectionMode {
        switch mode {
        case "full":
            return .full
        case "never":
            return .never
        default:
            return .automatic
        }
    }
}
