import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PaymentResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  success: boolean;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
  isOpen,
  onClose,
  success,
  message,
  buttonText = 'Go to Dashboard',
  onButtonClick,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col items-center">
                  {success ? (
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  ) : (
                    <XCircle className="h-12 w-12 text-red-500 mb-4" />
                  )}
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 text-center"
                  >
                    {success ? 'Payment Successful!' : 'Payment Failed'}
                  </Dialog.Title>
                  <div className="mt-2 mb-4">
                    <p className="text-sm text-gray-500 text-center">
                      {message}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      success
                        ? 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500'
                        : 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
                    }`}
                    onClick={onButtonClick || onClose}
                  >
                    {buttonText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 