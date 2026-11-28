require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = 'CapacitorCommunityStripe'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.default_subspec = 'Core'
  s.subspec 'Core' do |core|
    core.source_files = 'ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}'
  end
  s.subspec 'Embedded' do |embedded|
    embedded.dependency 'CapacitorCommunityStripe/Core'
    embedded.dependency 'WebViewNativeUIEngine', '1.1.0'
  end
  s.ios.deployment_target = '15.0'
  s.dependency 'Capacitor'
  s.dependency 'StripePaymentSheet', '~> 26.15.0'
  s.dependency 'StripeApplePay', '~> 26.15.0'
  s.swift_version = '5.1'
end
