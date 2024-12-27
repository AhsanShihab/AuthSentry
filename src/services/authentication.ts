import { Encryptor, InvalidEncryptorError } from "./encryption";
import * as firebase from "./firebase";
import * as vault from "./vault";

export const logIn = async (email: string, password: string) => {
  return await firebase.logIn(email, password);
};

export const logOut = () => {
  firebase.logOut();
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
  const currentEncryptor = await vault.getCurrentEncryptor();
  await currentEncryptor.loadSecret();
  const newEncryptor = new Encryptor(email, newPassword);
  newEncryptor.secret = currentEncryptor.secret;
  try {
    await vault.reEncryptData(newEncryptor);
    operationStatusCallback("previous", { status: "done" });
  } catch (err) {
    await firebase
      .deleteBackup()
      .catch(() => console.log("cloud backup is not removed"));
    operationStatusCallback("previous", { status: "failed" });
    if (err instanceof InvalidEncryptorError) {
      operationStatusCallback("new", {
        msg: "Your encryption secret may have changed from another session. Please logout and login again to start a new session",
        status: "warning",
      });
    }
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
        msg: "Database rollback failed! The old data still exists in the database backup but need to be recovered manually. Please contact the maintainer.",
        status: "warning",
      });
    }
  } else {
    await firebase
      .deleteBackup()
      .catch(() => console.log("cloud backup is not removed"));
    operationStatusCallback("new", { msg: "Done!", status: "done" });
    await newEncryptor.saveSecret();
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
  } catch (err) {
    await firebase
      .deleteBackup()
      .catch(() => console.log("cloud backup is not removed"));
    operationStatusCallback("previous", { status: "failed" });
    if (err instanceof InvalidEncryptorError) {
      operationStatusCallback("new", {
        msg: "Your old encryption secret may have changed from another session. Please logout and login again to start a new session",
        status: "warning",
      });
    }
    return;
  }
  await firebase
    .deleteBackup()
    .catch(() => console.log("cloud backup is not removed"));
  operationStatusCallback("new", { msg: "Done!", status: "done" });
  await newEncryptor.saveSecret();
  return newEncryptor;
};

export const changeSecret = () => {};
