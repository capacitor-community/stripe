
  Pod::Spec.new do |s|
    s.name = 'CapacitorStripe'
    s.version = '0.0.1'
    s.summary = 'Stripe Mobile SDK Wrapper for Capacitor'
    s.license = 'MIT'
    s.homepage = 'https://github.com/zyra/capacitor-stripe'
    s.author = 'Zyra Media Inc.'
    s.source = { :git => 'https://github.com/zyra/capacitor-stripe', :tag => s.version.to_s }
    s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
    s.ios.deployment_target  = '11.0'
    s.dependency 'Capacitor'
    s.dependency 'Stripe'
  end
