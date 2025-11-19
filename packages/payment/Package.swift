// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorCommunityStripe",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapacitorCommunityStripe",
            targets: ["StripePlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0"),
        .package(url: "https://github.com/stripe/stripe-ios-spm.git", exact: "25.1.0")
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
