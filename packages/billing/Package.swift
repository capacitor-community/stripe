// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorCommunityStripeBilling",
    platforms: [.iOS(.v15)],
    products: [.library(name: "CapacitorCommunityStripeBilling", targets: ["StripeBillingPlugin"])],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        // Experimental upstream SDK has no version tags. Review updates before changing this revision.
        .package(url: "https://github.com/stripe-samples/billing-ios-sdk.git",
                 revision: "02416cf6bb57fa9ede1786ea8ac127ea05fa9b87")
    ],
    targets: [
        .target(name: "StripeBillingPlugin", dependencies: [
            .product(name: "Capacitor", package: "capacitor-swift-pm"),
            .product(name: "Cordova", package: "capacitor-swift-pm"),
            .product(name: "BillingSDK", package: "billing-ios-sdk")
        ], path: "ios/Sources/StripeBillingPlugin"),
        .testTarget(name: "StripeBillingPluginTests", dependencies: ["StripeBillingPlugin"],
                    path: "ios/Tests/StripeBillingPluginTests")
    ]
)
