import { Encryptor } from "./encryption";
import * as firebase from "./firebase";
import * as vault from "./vault";

export const logIn = async (email: string, password: string) => {
  return await firebase.logIn(email, password);
};

export const logOut = async () => {
  await firebase.logOut();
};

export const register = async (email: string, password: string) => {
  return await firebase.signUp(email, password);
};

export const getCurrentUser = () => {
  return firebase.getCurrentUser();
};

export const verifyPassword = async (password: string) => {
  const isPasswordCorrect = await firebase
    .verifyPassword(password)
    .then(() => true)
    .catch(() => false);
  return isPasswordCorrect;
};

export const updateMasterPassword = async (
  newPassword: string,
  oldPassword: string,
  operationStatusCallback: (
    updateType: "previous" | "new",
    update: { msg?: string; status: "done" | "failed" | "warning" | "ongoing" }
  ) => void
) => {
  // verify old password
  operationStatusCallback("new", {
    msg: "Verifying password",
    status: "ongoing",
  });
  const isOldPasswordCorrect = await verifyPassword(oldPassword);
  if (!isOldPasswordCorrect) {
    operationStatusCallback("previous", { status: "failed" });
    operationStatusCallback("new", {
      msg: "Your password is incorrect",
      status: "warning",
    });
    return;
  }
  operationStatusCallback("previous", { status: "done" });

  // backup data
  try {
    operationStatusCallback("new", {
      msg: "Creating data backup",
      status: "ongoing",
    });
    await firebase.createBackup();
    operationStatusCallback("previous", { status: "done" });
  } catch {
    operationStatusCallback("previous", { status: "failed" });
    operationStatusCallback("new", {
      msg: "Could not create cloud backup. Operation aborted.",
      status: "warning",
    });
    return;
  }

  // re-encrypt data
  operationStatusCallback("new", {
    msg: "Re-encrypting data with the new password",
    status: "ongoing",
  });
  const email = getCurrentUser()!.email!;
  const newEncryptor = new Encryptor(email, newPassword);
  try {
    await vault.reEncryptData(newEncryptor);
    operationStatusCallback("previous", { status: "done" });
  } catch {
    await firebase
      .deleteBackup()
      .catch(() => console.log("cloud backup is not removed"));
    operationStatusCallback("previous", { status: "failed" });
    return;
  }

  // update account password
  operationStatusCallback("new", {
    msg: "Setting the master password",
    status: "ongoing",
  });
  let failed = false;
  try {
    await firebase.updateMasterPassword(newPassword);
    operationStatusCallback("previous", { status: "done" });
  } catch {
    failed = true;
    operationStatusCallback("previous", { status: "failed" });
  }

  if (failed) {
    operationStatusCallback("new", {
      msg: "Rolling back database changes",
      status: "ongoing",
    });
    try {
      await vault.restoreBackup();
      operationStatusCallback("previous", { status: "done" });
    } catch {
      operationStatusCallback("previous", { status: "failed" });

      // TODO: retry
      operationStatusCallback("new", {
        msg: "I did not prepare for this. Your data got messed up! I hope you made backup. :(",
        status: "warning",
      });
    }
  } else {
    await firebase
      .deleteBackup()
      .catch(() => console.log("cloud backup is not removed"));
    operationStatusCallback("new", { msg: "Done!", status: "done" });
    return newEncryptor;
  }
};

export const updateSecret = async (
  newSecret: string,
  password: string,
  operationStatusCallback: (
    updateType: "previous" | "new",
    update: { msg?: string; status: "done" | "failed" | "warning" | "ongoing" }
  ) => void
) => {
  // verify password
  operationStatusCallback("new", {
    msg: "Verifying password",
    status: "ongoing",
  });
  const isOldPasswordCorrect = await verifyPassword(password);
  if (!isOldPasswordCorrect) {
    operationStatusCallback("previous", { status: "failed" });
    operationStatusCallback("new", {
      msg: "Your password is incorrect",
      status: "warning",
    });
    return;
  }
  operationStatusCallback("previous", { status: "done" });

  // backup data
  try {
    operationStatusCallback("new", {
      msg: "Creating data backup",
      status: "ongoing",
    });
    await firebase.createBackup();
    operationStatusCallback("previous", { status: "done" });
  } catch {
    operationStatusCallback("previous", { status: "failed" });
    operationStatusCallback("new", {
      msg: "Could not create cloud backup. Operation aborted.",
      status: "warning",
    });
    return;
  }

  // re-encrypt data
  operationStatusCallback("new", {
    msg: "Re-encrypting data with the new secret",
    status: "ongoing",
  });
  const email = getCurrentUser()!.email!;
  const newEncryptor = new Encryptor(email, password);
  newEncryptor.secret = newSecret;
  try {
    await vault.reEncryptData(newEncryptor);
    operationStatusCallback("previous", { status: "done" });
  } catch {
    await firebase
      .deleteBackup()
      .catch(() => console.log("cloud backup is not removed"));
    operationStatusCallback("previous", { status: "failed" });
    return;
  }
  await firebase
    .deleteBackup()
    .catch(() => console.log("cloud backup is not removed"));
  operationStatusCallback("new", { msg: "Done!", status: "done" });
  newEncryptor.saveSecret();
  return newEncryptor;
};

export const changeSecret = () => {};
