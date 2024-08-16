@objc(FlagshipEnv)
class FlagshipEnv: NSObject {
  static func moduleName() -> String! {
    return "FlagshipEnv"
  }

  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func constantsToExport() -> [AnyHashable: Any]! {
    guard let infoDict = Bundle.main.infoDictionary,
          let showDevMenu = infoDict["FlagshipDevMenu"] as? Bool,
          let initialEnvName = infoDict["FlagshipEnv"] as? String else {
      fatalError("FlagshipEnv or FlagshipDevMenu not found in Info.plist")
    }

    let envName = UserDefaults.standard.string(forKey: "envName") ?? initialEnvName

    return ["envName": envName, "showDevMenu": showDevMenu]
  }

  @objc
  func setEnv(_ name: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    UserDefaults.standard.set(name, forKey: "envName")
    UserDefaults.standard.synchronize()
    resolve(nil)
  }
}
