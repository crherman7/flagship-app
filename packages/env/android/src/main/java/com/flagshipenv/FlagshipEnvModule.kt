package com.flagshipenv

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class FlagshipEnvModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun getConstants(): Map<String, Any> {
    val constants = HashMap<String, Any>()
    val context = reactApplicationContext

    constants["appName"] = context.getString(R.string.app_name)
    constants["envName"] = context.getString(R.string.flagship_env)
    constants["showDevMenu"] = context.getString(R.string.flagship_dev_menu)

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

  companion object {
    const val NAME = "FlagshipEnv"
  }
}
