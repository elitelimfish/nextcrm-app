"use client";
import { SallyTarget } from "@supportsally/react";

import { Button } from "@/components/ui/button";
import ModalDocumentView from "../ui/modal-document-view";
import Link from "next/link";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  document: any;
}

const DocumentViewModal = ({
  isOpen,
  onClose,
  loading,
  document,
}: AlertModalProps) => {

  const imageTypes = [
    "application/png",
    "application/jpg",
    "application/jpeg",
    "application/gif",
    "images/png",
    "images/jpg",
    "images/jpeg",
    "images/gif",
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "image/webp",
  ];

  console.log(document.document_file_mimeType, "mimeType");

  if (imageTypes.includes(document.document_file_mimeType)) {
    const imageUrl = document.document_file_url || "";
    return (
      <ModalDocumentView isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col h-full ">
          <div className="relative h-full p-10">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="Image preview" src={imageUrl} className="object-contain w-full h-full" />
            ) : (
              <p className="text-muted-foreground">No preview available</p>
            )}
          </div>
          <div className="pt-6 space-x-2 flex items-center justify-end w-full ">
            <SallyTarget id="cancel20" label="Cancel">
              <Button disabled={loading} variant={"outline"} onClick={onClose}>
                Cancel
              </Button>
            </SallyTarget>
          </div>
        </div>
      </ModalDocumentView>
    );
  }

  if (document.document_file_mimeType === "application/pdf") {
    return (
      <ModalDocumentView isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col h-full ">
          <embed
            style={{
              width: "100%",
              height: "100%",
            }}
            type="application/pdf"
            src={document.document_file_url}
          />
          <div className="pt-6 space-x-2 flex items-center justify-end w-full ">
            <SallyTarget id="cancel21" label="Cancel">
              <Button disabled={loading} variant={"outline"} onClick={onClose}>
                Cancel
              </Button>
            </SallyTarget>
          </div>
        </div>
      </ModalDocumentView>
    );
  } else {
    return (
      <ModalDocumentView isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col h-full ">
          This format can not be previewed. Please download the file to view it.
          <SallyTarget id="download" label="Download">
            <Button>
              <Link href={document.document_file_url}> Download</Link>
            </Button>
          </SallyTarget>
          <div className="pt-6 space-x-2 flex items-center justify-end w-full ">
            <SallyTarget id="cancel22" label="Cancel">
              <Button disabled={loading} variant={"outline"} onClick={onClose}>
                Cancel
              </Button>
            </SallyTarget>
          </div>
        </div>
      </ModalDocumentView>
    );
  }
};

export default DocumentViewModal;
