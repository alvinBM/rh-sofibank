"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Badge,
  Button,
  Divider,
} from "@nextui-org/react";
import { FiBell, FiCalendar, FiUser, FiCheckCircle } from "react-icons/fi";
import { useGetInternalAnnouncements, useMarkAnnouncementAsRead } from "@/src/hooks/useESS";

const CATEGORY_COLORS = {
  general: "default",
  hr: "primary",
  event: "secondary",
  policy: "warning",
  achievement: "success",
  birthday: "secondary",
  other: "default",
};

const CATEGORY_LABELS = {
  general: "Général",
  hr: "RH",
  event: "Événement",
  policy: "Politique",
  achievement: "Réalisation",
  birthday: "Anniversaire",
  other: "Autre",
};

const PRIORITY_COLORS = {
  low: "default",
  normal: "primary",
  high: "warning",
  urgent: "danger",
};

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useGetInternalAnnouncements();
  const markAsRead = useMarkAnnouncementAsRead();

  const handleMarkAsRead = async (announcementId) => {
    try {
      await markAsRead.mutateAsync(announcementId);
    } catch (error) {
      console.error("Error marking announcement as read:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiBell className="text-3xl text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Communications Internes</h1>
            <p className="text-default-500">Restez informé des actualités de l'entreprise</p>
          </div>
        </div>
        <Badge content={announcements?.length || 0} color="primary">
          <div className="w-8 h-8" />
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Chargement..." />
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              shadow="sm"
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Chip
                      size="sm"
                      color={CATEGORY_COLORS[announcement.category]}
                      variant="flat"
                    >
                      {CATEGORY_LABELS[announcement.category]}
                    </Chip>
                    <Chip
                      size="sm"
                      color={PRIORITY_COLORS[announcement.priority]}
                      variant="dot"
                    >
                      {announcement.priority}
                    </Chip>
                  </div>
                  <h3 className="text-lg font-bold">{announcement.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-default-500">
                    <div className="flex items-center gap-1">
                      <FiUser className="text-xs" />
                      <span>
                        {announcement.created_by_user?.firstname} {announcement.created_by_user?.lastname}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiCalendar className="text-xs" />
                      <span>{new Date(announcement.published_at || announcement.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <Divider />

              <CardBody>
                <div className="whitespace-pre-wrap text-default-700 mb-4">
                  {announcement.content}
                </div>

                {announcement.attachment_urls && announcement.attachment_urls.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">Pièces jointes:</p>
                    <div className="flex flex-wrap gap-2">
                      {announcement.attachment_urls.map((url, index) => (
                        <Button
                          key={index}
                          as="a"
                          href={url}
                          target="_blank"
                          size="sm"
                          variant="flat"
                        >
                          Fichier {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {announcement.expires_at && (
                  <p className="text-xs text-warning mb-4">
                    Expire le {new Date(announcement.expires_at).toLocaleDateString("fr-FR")}
                  </p>
                )}

                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<FiCheckCircle />}
                  onPress={() => handleMarkAsRead(announcement.id)}
                >
                  Marquer comme lu
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-12">
            <FiBell className="mx-auto text-4xl text-default-300 mb-4" />
            <p className="text-default-500">Aucune annonce pour le moment</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
