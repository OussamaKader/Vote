import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-6 text-sm text-slate-600">{description}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="default" onClick={onConfirm}>
          Confirmer
        </Button>
      </div>
    </Modal>
  );
}
