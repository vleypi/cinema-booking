"use client";

import { joinClassNames } from "@luch/shared/lib";
import { useState } from "react";
import { Button, PANEL_CLASS_NAME } from "@/shared/ui";
import { type ICustomerProfile, useUpdateCustomerProfile } from "@/entities/customer";
import { CABINET_TEXT } from "@/views/cabinet/constants/cabinet.constant";

interface IProfileCardProps {
  profile: ICustomerProfile;
}

const INPUT_CLASS_NAME =
  "w-full rounded-frame border border-paper/18 bg-ink px-3.5 py-2.5 text-sm text-paper placeholder:text-paper/32 focus:border-warm focus:outline-none";

export const ProfileCard = ({ profile }: IProfileCardProps) => {
  const [name, setName] = useState(profile.name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [savedNotice, setSavedNotice] = useState(false);
  const updateProfile = useUpdateCustomerProfile();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedNotice(false);
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
      });
      setSavedNotice(true);
    } catch {
      setSavedNotice(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className={joinClassNames(PANEL_CLASS_NAME, "grid max-w-xl gap-5 bg-ink-2 p-6 sm:p-8")}>
      <h2 className="font-display text-2xl font-medium uppercase">{CABINET_TEXT.profileTitle}</h2>

      <div className="grid gap-1.5 text-sm">
        <span className="text-paper/56">{CABINET_TEXT.emailLabel}</span>
        <span className="font-mono text-base text-paper">{profile.email}</span>
      </div>

      <label className="grid gap-1.5 text-sm">
        <span className="text-paper/72">{CABINET_TEXT.nameLabel}</span>
        <input
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSavedNotice(false);
          }}
          placeholder={CABINET_TEXT.namePlaceholder}
          className={INPUT_CLASS_NAME}
        />
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="text-paper/72">{CABINET_TEXT.phoneLabel}</span>
        <input
          type="tel"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setSavedNotice(false);
          }}
          placeholder={CABINET_TEXT.phonePlaceholder}
          className={INPUT_CLASS_NAME}
        />
      </label>

      {updateProfile.isError && <p className="text-sm text-signal">{CABINET_TEXT.profileError}</p>}
      {savedNotice && <p className="text-sm text-warm">{CABINET_TEXT.profileSaved}</p>}

      <div>
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? CABINET_TEXT.savingProfile : CABINET_TEXT.saveProfile}
        </Button>
      </div>
    </form>
  );
};
