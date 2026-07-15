"use client";

import { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, Settings2, Save, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateSessionTimeoutMinutes } from "@/action/settings.action";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useTranslation } from "@/locale/use-translation";
import type { TranslationKey } from "@/locale/config";

const NOTIF_KEY = "hwp:notif-prefs";

interface NotifPrefs {
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

const defaultNotifPrefs: NotifPrefs = {
  emailNotifications: true,
  inAppNotifications: true,
};

const navItems = [
  { id: "notifications", labelKey: "settings.notificationsNav", icon: Bell },
  { id: "system", labelKey: "settings.systemNav", icon: Settings2 },
] as const;

type NavId = (typeof navItems)[number]["id"];

const NOTIF_ITEMS: { key: keyof NotifPrefs; labelKey: TranslationKey; descKey: TranslationKey }[] = [
  { key: "emailNotifications", labelKey: "settings.emailNotifications", descKey: "settings.emailNotificationsDesc" },
  { key: "inAppNotifications", labelKey: "settings.inAppNotifications", descKey: "settings.inAppNotificationsDesc" },
];

// ─── Sections ─────────────────────────────────────────────────────────────────

function NotificationsSection() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<NotifPrefs>(defaultNotifPrefs);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  function handleChange(key: keyof NotifPrefs, value: boolean) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    toast.success(t("settings.preferenceSaved"));
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("settings.notificationsTitle")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("settings.notificationsSubtitle")}
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        {NOTIF_ITEMS.map(({ key, labelKey, descKey }) => (
          <div key={key} className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">{t(labelKey)}</Label>
              <p className="text-sm text-muted-foreground">{t(descKey)}</p>
            </div>
            <div className="flex items-center gap-2">
              {prefs[key] ? <Bell className="h-4 w-4 text-emerald-500" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
              <Switch checked={prefs[key]} onCheckedChange={(v) => handleChange(key, v)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SESSION_TIMEOUT_OPTIONS: { value: number; labelKey: TranslationKey }[] = [
  { value: 1, labelKey: "settings.min1" },
  { value: 15, labelKey: "settings.min15" },
  { value: 30, labelKey: "settings.min30" },
  { value: 60, labelKey: "settings.hour1" },
  { value: 240, labelKey: "settings.hour4" },
  { value: 480, labelKey: "settings.hour8" },
  { value: 1440, labelKey: "settings.hour24" },
  { value: 10080, labelKey: "settings.days7" },
];

function SystemSection({ initialSessionTimeoutMinutes, portalName, supportEmail }: { initialSessionTimeoutMinutes: number; portalName: string; supportEmail: string }) {
  const { t } = useTranslation();
  const [sessionTimeout, setSessionTimeout] = useState(initialSessionTimeoutMinutes);
  const [savingTimeout, setSavingTimeout] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    toast.success(t("settings.systemSettingsSaved"));
  }

  async function handleSessionTimeoutSave() {
    setSavingTimeout(true);
    try {
      await updateSessionTimeoutMinutes(sessionTimeout);
      toast.success(t("settings.sessionTimeoutUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("settings.sessionTimeoutFailed"));
    } finally {
      setSavingTimeout(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("settings.systemTitle")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("settings.systemSubtitle")}
        </p>
      </div>
      <Separator />
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="company-name">{t("settings.portalNameLabel")}</Label>
          <Input id="company-name" value={portalName} readOnly />
          <p className="text-sm text-muted-foreground">{t("settings.portalNameHint")}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="support-email">{t("settings.supportEmailLabel")}</Label>
          <Input id="support-email" type="email" value={supportEmail} readOnly />
          <p className="text-sm text-muted-foreground">{t("settings.supportEmailHint")}</p>
        </div>
        <Button type="submit" disabled className="flex items-center gap-2 opacity-60 cursor-not-allowed">
          <Save className="h-4 w-4" />
          {t("settings.readOnlyField")}
        </Button>
      </form>

      <Separator />

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base">{t("settings.sessionTimeoutLabel")}</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("settings.sessionTimeoutHint")}
        </p>
        <div className="flex items-center gap-3">
          <Select value={String(sessionTimeout)} onValueChange={(v) => setSessionTimeout(Number(v))}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SESSION_TIMEOUT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>{t(opt.labelKey)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={handleSessionTimeoutSave}
            disabled={savingTimeout || sessionTimeout === initialSessionTimeoutMinutes}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {savingTimeout ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Animated sidebar nav ─────────────────────────────────────────────────────

function SidebarNav({ active, onChange }: { active: NavId; onChange: (id: NavId) => void }) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLButtonElement>(`[data-nav="${active}"]`);
    if (!activeEl) return;
    setIndicatorStyle({
      top: activeEl.offsetTop,
      height: activeEl.offsetHeight,
    });
  }, [active]);

  return (
    <div ref={containerRef} className="relative flex flex-col space-y-1">
      {/* sliding bar */}
      <span
        className="absolute left-0 w-0.5 rounded-full bg-primary transition-all duration-300 ease-in-out"
        style={{ top: indicatorStyle.top, height: indicatorStyle.height }}
      />

      {navItems.map(({ id, labelKey, icon: Icon }) => (
        <button
          key={id}
          data-nav={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-2 rounded-md pl-4 pr-3 py-2 text-sm font-medium transition-colors w-full text-left",
            active === id
              ? "text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function SettingsForm({ initialSessionTimeoutMinutes, portalName, supportEmail }: { initialSessionTimeoutMinutes: number; portalName: string; supportEmail: string }) {
  const [active, setActive] = useState<NavId>("notifications");

  const sectionMap: Record<NavId, React.ReactNode> = {
    notifications: <NotificationsSection />,
    system: <SystemSection initialSessionTimeoutMinutes={initialSessionTimeoutMinutes} portalName={portalName} supportEmail={supportEmail} />,
  };

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="lg:w-48 shrink-0">
        <SidebarNav active={active} onChange={setActive} />
      </aside>
      <div className="flex-1 max-w-2xl">
        {sectionMap[active]}
      </div>
    </div>
  );
}
