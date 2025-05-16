import React from "react";

type ErrorMessageProps = {
  message: string;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex justify-center items-center mt-2 rounded-lg bg-red-100 p-3 text-sm text-red-700 border border-red-300">
      ⚠️ {message}
    </div>
  );
};

export default ErrorMessage;
