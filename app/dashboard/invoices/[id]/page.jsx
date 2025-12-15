import InvoiceDetail from "@/app/ui/dashboard/invoices/InvoiceDetail";
import { Spinner } from "@nextui-org/react";
import React from "react";

const InvoiceItem = async ({ params }) => {
    const id = (await params).id;
    return (
        <>
            {id ? (
                <InvoiceDetail id={id} />
            ) : (
                <div className="flex flex-col gap-3 justify-center items-center h-full bg-background rounded-xl">
                    <Spinner color="default" className="text-teal-500" size="lg" />
                    <p className="text-default-500">Chargement en cours...</p>
                </div>
            )}
        </>
    );
};
export default InvoiceItem;
