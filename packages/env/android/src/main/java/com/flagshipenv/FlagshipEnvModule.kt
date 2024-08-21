package com.flagshipenv

import android.annotation.SuppressLint
import android.content.Context

import android.content.SharedPreferences
import android.content.pm.PackageInfo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class FlagshipEnvModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val sharedPref: SharedPreferences = reactContext.getSharedPreferences("__ENV_NAME_STORE", Context.MODE_PRIVATE)

  override fun getName(): String {
    return NAME
  }

  override fun getConstants(): Map<String, Any> {
    val constants = HashMap<String, Any>()
    val context = reactApplicationContext

    context.getString(R.string.flagship_env)

    // TODO: get envName from strings.xml
    val initialEnvName = "prod";
    val envName = sharedPref.getString("envName", initialEnvName) ?: initialEnvName

    constants["envName"] = envName

    // TODO: get showDevMenu from strings.xml
    constants["showDevMenu"] = true
    constants["appVersion"] = getPackageInfo().versionName
    constants["buildNumber"] = getPackageInfo().versionCode.toString()

    return constants
  }

  @SuppressLint("ApplySharedPref")
  @ReactMethod
  fun setEnv(name: String, promise: Promise) {
      val editor = sharedPref.edit()
      editor.putString("envName", name)
      editor.commit()

      promise.resolve(null)
  }

  @Throws(Exception::class)
  private fun getPackageInfo(): PackageInfo {
      val packageManager = reactApplicationContext.packageManager
      val packageName = reactApplicationContext.packageName
      return packageManager.getPackageInfo(packageName, 0)
  }


  companion object {
    const val NAME = "FlagshipEnv"
  }
}
