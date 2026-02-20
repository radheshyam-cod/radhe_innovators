"""
File encryption utilities for secure VCF storage.

Encrypts uploaded files at rest using AES-256-GCM.
"""

import os
from pathlib import Path
from typing import Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
import structlog

logger = structlog.get_logger()


class FileEncryption:
    """AES-256-GCM file encryption service."""

    def __init__(self, key: Optional[bytes] = None):
        """
        Initialize encryption service.

        Args:
            key: 32-byte encryption key. If None, reads from ENCRYPTION_KEY env var.
        """
        if key is None:
            key_hex = os.getenv("ENCRYPTION_KEY")
            if not key_hex:
                raise ValueError("ENCRYPTION_KEY environment variable not set")
            if len(key_hex) != 64:  # 32 bytes = 64 hex chars
                raise ValueError("ENCRYPTION_KEY must be 64 hex characters (32 bytes)")
            key = bytes.fromhex(key_hex)

        if len(key) != 32:
            raise ValueError("Encryption key must be 32 bytes")

        self.aesgcm = AESGCM(key)
        self.backend = default_backend()

    def encrypt_file(self, file_path: Path, output_path: Optional[Path] = None) -> Path:
        """
        Encrypt a file using AES-256-GCM.

        Returns path to encrypted file.
        """
        if output_path is None:
            output_path = file_path.with_suffix(file_path.suffix + ".encrypted")

        with open(file_path, "rb") as f:
            plaintext = f.read()

        # Generate nonce (12 bytes for GCM)
        nonce = os.urandom(12)

        # Encrypt
        ciphertext = self.aesgcm.encrypt(nonce, plaintext, None)

        # Write: nonce (12 bytes) + ciphertext
        with open(output_path, "wb") as f:
            f.write(nonce + ciphertext)

        logger.info("File encrypted", input=str(file_path), output=str(output_path))
        return output_path

    def decrypt_file(self, encrypted_path: Path, output_path: Optional[Path] = None) -> Path:
        """
        Decrypt a file.

        Returns path to decrypted file.
        """
        if output_path is None:
            output_path = encrypted_path.with_suffix("").with_suffix(
                encrypted_path.suffix.replace(".encrypted", "")
            )

        with open(encrypted_path, "rb") as f:
            data = f.read()

        # Extract nonce and ciphertext
        nonce = data[:12]
        ciphertext = data[12:]

        # Decrypt
        plaintext = self.aesgcm.decrypt(nonce, ciphertext, None)

        with open(output_path, "wb") as f:
            f.write(plaintext)

        logger.info("File decrypted", input=str(encrypted_path), output=str(output_path))
        return output_path
