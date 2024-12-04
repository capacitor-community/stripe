// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorCommunityStripe",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "StripePlugin",
            targets: ["StripePlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main"),
        .package(url: "https://github.com/stripe/stripe-ios-spm.git", exact: "23.32.0")
    ],
    targets: [
        .target(
            name: "StripePlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "StripePaymentSheet", package: "stripe-ios-spm"),
                .product(name: "StripeApplePay", package: "stripe-ios-spm")
            ],
            path: "ios/Sources/StripePlugin"),
        .testTarget(
            name: "StripePluginTests",
            dependencies: ["StripePlugin"],
            path: "ios/Tests/StripePluginTests")
    ]
)
