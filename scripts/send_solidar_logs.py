#!/usr/bin/env python
# -*- coding: utf-8 -*-
from future import standard_library
standard_library.install_aliases()

import os
import tarfile
import io
import time
from consolemsg import step, error, warn, fail, success
import smtplib
from email.message import EmailMessage
from pathlib import Path
from datetime import datetime, timedelta, date
import argparse
from config import solidar, user_solidar
import paramiko


BASE_URL = solidar['server']
USERNAME = solidar['user']
PASSWORD = solidar['password']
BASE_PATH = solidar['logs_directory']
FILE_NAME = solidar['file_name']


def sendmail2all(user, attachment, email):
    """
    Sends logs by email using smtplib only.
    """
    warn('User info: {}'.format(user))

    recipients = user["recipients"] + email.split(",")
    bcc = user.get("bcc", [])

    msg = EmailMessage()
    msg["From"] = user["sender"]
    msg["To"] = ", ".join(recipients)
    msg["Subject"] = "[Solidar] Logs PVGIScalls"

    msg.set_content("Hola, os adjuntamos un zip con los logs de Solidar :)")

    step("Attaching {} ...".format(attachment))

    # Attach the ZIP file
    with open(attachment, "rb") as f:
        msg.add_attachment(
            f.read(),
            maintype="application",
            subtype="zip",
            filename=Path(attachment).name,
        )

    # SMTP configuration
    smtp_host = user["smtp_host"]
    smtp_port = user["smtp_port"]
    smtp_use_tls = user["use_tls"]
    smtp_username = user["username"]
    smtp_password = user["password"]

    step("Connecting to {}:{} as {}...".format(smtp_host, smtp_port, smtp_username))

    with smtplib.SMTP(smtp_host, smtp_port) as smtp:
        smtp.ehlo()

        if smtp_use_tls:
            smtp.starttls()

        if smtp_username:
            smtp.login(smtp_username, smtp_password)

        step("Sending email...")

        smtp.send_message(msg, to_addrs=recipients + bcc)

        success("Mail sent")

def make_tarfile(output_filename, file_content):
    with tarfile.open(output_filename, "w:gz") as tar:
        content = file_content.encode('utf-8')
        info = tarfile.TarInfo(name=output_filename)
        info.size = len(content)
        info.mtime = time.time()
        tar.addfile(info, io.BytesIO(content))

def get_file_from_server():
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        client.connect(BASE_URL, username=USERNAME, password=PASSWORD, port=2200)

        sftp = client.open_sftp()

        remote_file = '{}{}.txt'.format(BASE_PATH, FILE_NAME) 

        with sftp.open(remote_file, "r") as f:
            file_content = f.read().decode()

        sftp.close()
        client.close()

        return file_content

def main(email):
    today = datetime.today().date()

    try:
        file_content = get_file_from_server()
        tar_filename = '/tmp/{}_{}.tar.gz'.format(FILE_NAME, datetime.now().strftime("%Y-%m-%d"))
        make_tarfile(tar_filename, file_content)    
    except Exception as e:
        print("Error en comprimir le fitxer {}".format(FILE_NAME))

    step('ready to send the email')

    sendmail2all(user_solidar, tar_filename, email)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
            description='Script envia email amb Solidar logs'
    )

    parser.add_argument(
        '--email',
        dest='email',
        required=True,
        help="Introdueix la direcció de correu on rebre la informació. Si n'hi ha més d'una, separar-les per ,"
    )

    args = parser.parse_args()

    main(args.email)
