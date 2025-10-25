'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQSO } from '@/contexts/QSOContext';
import { Map, MapPin } from 'lucide-react';

// Dynamically import QSOWorldMap to avoid SSR issues
const QSOWorldMap = dynamic(
  () => import('@/components/Map/QSOWorldMap'),
  {
    ssr: false,
    loading: () => <div className="text-center p-4">Harita yükleniyor...</div>
  }
);

interface QSOMapModalProps {
  show: boolean;
  onHide: () => void;
}

const QSOMapModal: React.FC<QSOMapModalProps> = ({ show, onHide }) => {
  const { qsoRecords } = useQSO();

  // Count records with grid squares
  const recordsWithLocation = qsoRecords.filter(
    record => record.qth && record.qth.trim().length >= 4
  );

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            QSO Haritası
            <span className="ml-2 text-sm text-muted-foreground font-normal">
              ({recordsWithLocation.length} konum)
            </span>
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
        <div>
          {recordsWithLocation.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-3" />
                <p className="mt-3">Grid square bilgisi olan QSO kaydı bulunmuyor</p>
              </div>
            </div>
          ) : (
            <div style={{ height: '400px' }}>
              <QSOWorldMap qsoRecords={qsoRecords} height="100%" />
            </div>
          )}
        </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-2 md:gap-3 w-full justify-center flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <small>FM</small>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <small>SSB</small>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <small>Digital (FT8/DMR/etc)</small>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <small>CW</small>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <small>AM</small>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <small>Other</small>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QSOMapModal;
