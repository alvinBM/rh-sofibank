import * as React from "react";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";
import { IoArrowForward } from "react-icons/io5";

const MultistepNavigationButtons = React.forwardRef(({ className, onBack, onNext, backButtonProps, page, formData, nextButtonProps, ...props }, ref) => {
    const [isDisabled, setIsDisabled] = React.useState(true);

    React.useEffect(() => {
        if ((page == 1 && formData?.companyName != "" && formData?.category != "") || (page == 2 && formData?.nbEmployees != "" && formData?.primaryCurrency != "") || (page == 3 && formData?.city != "" && formData?.country != "")) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }, [page, formData]);

    if (page == 4) {
        return null;
    }

    return (
        <div ref={ref} className={cn("mx-0 my-0 flex w-full items-center justify-start gap-x-4 lg:mx-0", className)} {...props}>
            {page != 1 && (
                <Button className="rounded-medium px-6 py-6 border-default-200 text-medium font-medium text-default-500" variant="bordered" onPress={onBack} {...backButtonProps}>
                    <Icon icon="solar:arrow-left-outline" width={24} />
                    Retour
                </Button>
            )}

            <Button isDisabled={isDisabled} endContent={<Icon icon="solar:arrow-right-outline" width={24} />} className="text-medium font-medium bg-red-600 text-white px-10 py-6" type="submit" onPress={onNext}>
                {nextButtonProps?.children || "Suivant"}
            </Button>
        </div>
    );
});

MultistepNavigationButtons.displayName = "MultistepNavigationButtons";

export default MultistepNavigationButtons;
