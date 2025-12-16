// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorCommunityStripeIdentity",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorCommunityStripeIdentity",
            targets: ["StripeIdentityPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/stripe/stripe-ios-spm.git", exact: "25.3.0")
    ],
    targets: [
        .target(
            name: "StripeIdentityPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "StripeIdentity", package: "stripe-ios-spm")
            ],
            path: "ios/Sources/StripeIdentityPlugin"),
        .testTarget(
            name: "StripeIdentityPluginTests",
            dependencies: ["StripeIdentityPlugin"],
            path: "ios/Tests/StripeIdentityPluginTests")
    ]
)
