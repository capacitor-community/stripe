import Foundation
import Capacitor
import StripeIdentity

@objc public class StripeIdentity: NSObject {
    weak var plugin: StripeIdentityPlugin?
    var identityVerificationSheet: IdentityVerificationSheet?

    func initialize(_ call: CAPPluginCall) {
        call.resolve()
    }

    func create(_ call: CAPPluginCall) {
        let verificationId = call.getString("verificationId") ?? nil
        let ephemeralKeySecret = call.getString("ephemeralKeySecret") ?? nil

        if verificationId == nil || ephemeralKeySecret == nil {
            let errorText = "Invalid Params. this method require verificationId or ephemeralKeySecret."
            self.plugin?.notifyListeners(IdentityVerificationSheetEvents.FailedToLoad.rawValue, data: ["message": errorText])
            call.reject(errorText)
            return
        }

        if let iconFileName = Bundle.main.object(forInfoDictionaryKey: "CFBundleIcons") as? [String: Any],
           let primaryIcon = iconFileName["CFBundlePrimaryIcon"] as? [String: Any],
           let iconFilesArray = primaryIcon["CFBundleIconFiles"] as? [String],
           let fileName = iconFilesArray.first {

            let configuration = IdentityVerificationSheet.Configuration(
                brandLogo: UIImage(named: fileName) ?? UIImage()
            )

            self.identityVerificationSheet = IdentityVerificationSheet(
                verificationSessionId: verificationId!,
                ephemeralKeySecret: ephemeralKeySecret!,
                configuration: configuration
            )

            self.plugin?.notifyListeners(IdentityVerificationSheetEvents.Loaded.rawValue, data: [:])
            call.resolve([:])
        } else {
            let errorText = "CFBundleIcons or CFBundlePrimaryIcon or CFBundleIconFiles is not found. You should check ios image assets"
            self.plugin?.notifyListeners(IdentityVerificationSheetEvents.FailedToLoad.rawValue, data: ["message": errorText])
            call.reject(errorText)
        }
    }

    func present(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let rootViewController = self.plugin?.getRootVC() {
                self.identityVerificationSheet!.present(from: rootViewController, completion: { result in
                    switch result {
                    case .flowCompleted:
                        // The user has completed uploading their documents.
                        // Let them know that the verification is processing.
                        print("Verification Flow Completed!")
                        self.plugin?.notifyListeners(IdentityVerificationSheetEvents.VerificationResult.rawValue, data: [
                            "result": IdentityVerificationSheetEvents.Completed.rawValue
                        ])
                        call.resolve([:])
                    case .flowCanceled:
                        // The user did not complete uploading their documents.
                        // You should allow them to try again.
                        print("Verification Flow Canceled!")
                        self.plugin?.notifyListeners(IdentityVerificationSheetEvents.VerificationResult.rawValue, data: [
                            "result": IdentityVerificationSheetEvents.Canceled.rawValue
                        ])
                        call.resolve([:])
                    case .flowFailed(let error):
                        // If the flow fails, you should display the localized error
                        // message to your user using error.localizedDescription
                        print("Verification Flow Failed!")
                        print(error.localizedDescription)
                        self.plugin?.notifyListeners(IdentityVerificationSheetEvents.VerificationResult.rawValue, data: [
                            "result": IdentityVerificationSheetEvents.Failed.rawValue,
                            "error": [
                                "message": error.localizedDescription
                            ]
                        ])
                        call.resolve([:])
                    }
                })
            }
        }
    }
}
