"use client";
import { modalDefaulMotionProps } from "@/src/constants/animations";
import { Button, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AlertMessage from "../../AlertMessage";

const paymentSchema = yup.object().shape({
    amount: yup.number().required("Veuillez entrer le montant").positive("Le montant doit être positif"),
    reference: yup.string(),
    note: yup.string(),
});

const PayInvoiceFormModal = ({ isOpen, onOpenChange, invoice, onSubmitResult }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(paymentSchema),
        defaultValues: {
            amount: invoice?.remaining_amount || 0,
            reference: "",
            note: "",
        },
    });

    const onSubmit = async (data) => {
        setError(null);
        setLoading(true);
        try {
            onSubmitResult({ success: true, data });
            onOpenChange(false);
            reset();
        } catch (err) {
            setError({
                type: "danger",
                message: "Une erreur est survenue lors du paiement",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isDismissable={false} motionProps={modalDefaulMotionProps} size="md" isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
            <ModalContent>
                {(onClose) => (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="px-5 mt-10">
                                <AlertMessage type={error.type} message={error.message} onClose={() => setError(null)} />
                            </div>
                        )}
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="space-y-1">
                                <h4 className="text-medium font-medium">PAYER LA FACTURE</h4>
                                <p className="text-small text-default-400 font-light">Enregistrez un paiement pour cette facture</p>
                            </div>
                            <Divider className="my-1" />
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                <Controller
                                    name="amount"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            label="Montant"
                                            placeholder="Entrez le montant du paiement"
                                            variant={errors.amount ? "bordered" : "flat"}
                                            radius="sm"
                                            isInvalid={!!errors.amount}
                                            errorMessage={errors.amount?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="reference"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Référence"
                                            placeholder="Numéro de référence du paiement"
                                            variant={errors.reference ? "bordered" : "flat"}
                                            radius="sm"
                                            isInvalid={!!errors.reference}
                                            errorMessage={errors.reference?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="note"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Note"
                                            placeholder="Note facultative"
                                            variant={errors.note ? "bordered" : "flat"}
                                            radius="sm"
                                            isInvalid={!!errors.note}
                                            errorMessage={errors.note?.message}
                                        />
                                    )}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="default"
                                variant="flat"
                                onPress={() => {
                                    reset();
                                    onClose();
                                }}
                                disabled={loading}
                            >
                                Annuler
                            </Button>
                            <Button className="bg-teal-700 text-white" type="submit" isLoading={loading}>
                                Enregistrer le paiement
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
};

export default PayInvoiceFormModal;
