// Helper functions للحصول على الإعدادات
import { prisma } from './prisma'
import { AllSettings, SettingGroup, defaultSettings } from '@/types/settings.types'

// Cache للإعدادات لتحسين الأداء
let settingsCache: AllSettings | null = null
let lastCacheTime: number = 0
const CACHE_DURATION = 5 * 1000 // 5 ثواني فقط للتحديث السريع

/**
 * الحصول على جميع الإعدادات
 */
export async function getAllSettings(): Promise<AllSettings> {
  // استخدام الكاش إذا كان لا يزال صالحًا
  const now = Date.now()
  if (settingsCache && (now - lastCacheTime) < CACHE_DURATION) {
    return settingsCache
  }

  try {
    const settings = await prisma.setting.findMany()

    const allSettings: Partial<AllSettings> = {}

    // دمج الإعدادات من قاعدة البيانات
    for (const setting of settings) {
      allSettings[setting.settingGroup as SettingGroup] = setting.settingValue as any
    }

    // دمج مع القيم الافتراضية للمجموعات المفقودة
    const finalSettings: AllSettings = {
      ...defaultSettings,
      ...allSettings
    }

    // تحديث الكاش
    settingsCache = finalSettings
    lastCacheTime = now

    return finalSettings
  } catch (error) {
    console.error('Error fetching all settings:', error)
    // إرجاع القيم الافتراضية في حالة الخطأ
    return defaultSettings
  }
}

/**
 * الحصول على إعدادات مجموعة معينة
 */
export async function getSettingsByGroup<T extends SettingGroup>(
  group: T
): Promise<AllSettings[T]> {
  try {
    const setting = await prisma.setting.findFirst({
      where: {
        settingGroup: group
      }
    })

    if (!setting) {
      return defaultSettings[group]
    }

    return setting.settingValue as AllSettings[T]
  } catch (error) {
    console.error(`Error fetching settings for group ${group}:`, error)
    return defaultSettings[group]
  }
}

/**
 * تحديث إعدادات مجموعة معينة
 */
export async function updateSettingsByGroup<T extends SettingGroup>(
  group: T,
  data: AllSettings[T]
): Promise<void> {
  try {
    await prisma.setting.upsert({
      where: {
        settingKey: group
      },
      update: {
        settingValue: data,
        settingGroup: group
      },
      create: {
        settingKey: group,
        settingValue: data,
        settingGroup: group
      }
    })

    // إلغاء الكاش بعد التحديث
    clearSettingsCache()
  } catch (error) {
    console.error(`Error updating settings for group ${group}:`, error)
    throw error
  }
}

/**
 * إلغاء كاش الإعدادات
 */
export function clearSettingsCache(): void {
  settingsCache = null
  lastCacheTime = 0
}

/**
 * الحصول على قيمة إعداد معين
 */
export async function getSettingValue<T extends SettingGroup, K extends keyof AllSettings[T]>(
  group: T,
  key: K
): Promise<AllSettings[T][K]> {
  const settings = await getSettingsByGroup(group)
  return settings[key]
}

