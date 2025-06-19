// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorCommunityStripeTerminal",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapacitorCommunityStripeTerminal",
            targets: ["StripeTerminalPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0"),
        .package(url: "https://github.com/stripe/stripe-terminal-ios.git", exact: "4.3.0")
    ],
    targets: [
        .target(
            name: "StripeTerminalPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "StripeTerminal", package: "stripe-terminal-ios")
            ],
            path: "ios/Sources/StripeTerminalPlugin"),
        .testTarget(
            name: "StripeTerminalPluginTests",
            dependencies: ["StripeTerminalPlugin"],
            path: "ios/Tests/StripeTerminalPluginTests")
    ]
)
