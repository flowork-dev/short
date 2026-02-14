#######################################################################
# WEBSITE https://flowork.cloud
# File NAME : C:\FLOWORK\backup.py total lines 431
#######################################################################

import os
import logging
import time
import shutil
import re
import traceback
# from tools.backup_system.archiver import Archiver

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

class Archiver:
    """Encapsulates all logic for cleaning source files and creating the FLOWORK_V1.TXT archive."""

    def __init__(self, project_root):
        self.project_root = project_root

        self.backup_filename = "FLOWORK_V1.TXT"
        self.backup_dir = os.path.join(self.project_root, "backup", "plan")
        self.backup_file_path = os.path.join(self.backup_dir, self.backup_filename)
        self.awenk_pattern = re.compile(
            r"#######################################################################.*?awenk audico.*?#######################################################################\n?",
            re.DOTALL,
        )
        self.new_header_pattern = re.compile(
            r"^(?:#|//|REM)#######################################################################.*?^(?:#|//|REM)#######################################################################\n?",
            re.DOTALL | re.MULTILINE, # <-- DIPERBAIKI (sebelumnya MULTLINE)
        )
        self.excluded_dirs_entirely = {
            ".cloudflared",
            ".egg-info",
            ".git",
            ".idea",
            ".mypy_cache",
            ".pytest_cache",
            ".ruff_cache",
            ".venv",
            ".vscode",
            ".wrangler",
            "node_modules",
            "__pycache__",
            "_logs",
            "ai_models",
            "assets",
            "backup",
            "build",
            "dist",
            "docs",
            "logs",
            "monitoring",
            "node_modules",
            "nodejs",  # Diambil dari .bat
            "python",
            "pytest_cache",  # Diambil dari .bat
            "mypy_cache",  # Diambil dari .bat
            "ruff_cache",  # Diambil dari .bat
            "scripts",
            "supabase",
            "themes",
            "users",
            "vendor",
            "venv",  # Diambil dari .bat
            "venv/",
            "backup",
            "2.31.0",
            "flowork-gui",
            "data",
            "unsloth_compiled_cache",
        }

        self.excluded_files = {
            self.backup_filename,
            self.backup_filename,
            ".dockerignore",  # Diambil dari .bat (sebelumnya di dirs)
            ".gitignore",
            "backup.py",
            "cleaner_tool.py",
            "datasets.json",
            "dump.rdb",
            "get-pip.py",
            "license.lic",
            "metrics_history.jsonl",
            "mkdocs.yml",
            "npm_gui_build_log.txt",
            "nuitka-crash-report.xml",
            "pip_core_log.txt",
            "pip_gateway_log.txt",
            "pip_momod_api_log.txt",
            "refactor_scanners.py",
            "run_scanners_cli.py",
            "settings.json",
            "site_file.txt",
            "state.json",
            "trigger_index.cache",
            "backup.py",
            "dump.rdb",
            ".dockerignore",
            ".gitignore",
            "5-UPLOAD_MOMOD_GUI.bat",
            "6-UPLOAD_FLOWORK_GUI.bat",
            "7-upload-docs.bat",
            "8.PUBLISH.bat",
            "9.UPLOAD_ALL_PROJECT.bat",
            "10-FILE_MAP.bat",
            "pre_launcher.pid",
            "ARCHITECTURE.md",
            "CHANGELOG.md",
            "CODE_OF_CONDUCT.md",
            "CONTRIBUTING.md",
            "GOVERNANCE.md",
            "LICENSE.md",
            "README.md",
            "ROADMAP.md",
            "SECURITY.md",
            "dependency_installer.py",
        }

        self.allowed_extensions_for_content = {
            ".py",
            ".json",
            ".html",
            ".js",
            ".vue",
            ".yml",
            ".txt",
            ".env",
            ".stable",
            ".sh",
            ".conf",
            ".bat",
            ".yaml",
        }

        self.included_specific_files_for_content = set()
        self.excluded_extensions_for_map = {
            ".awenkaudico",
            ".teetah",
            ".pyd",
            ".aola",
            ".so",
            ".c",
            ".egg-info",
            ".vendor_hash",
            ".module.flowork",
            ".plugin.flowork",
            ".flowork",
            ".log",
            ".db",
            ".sqlite3",
            ".pyc",
            ".pyo",
            ".md",
            ".MD",
        }

    def _get_line_count(self, file_path):
        """
        Counts the total number of lines in a file, including empty ones.
        """
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                line_count = sum(1 for line in f)
            return line_count
        except Exception as e:
            logging.error(f"ARCHIVER: Could not count lines for {file_path}: {e}")
            return 0

    def clean_pycache(self):
        logging.info("Starting Python cache cleanup...")
        cleaned_count = 0
        for root, dirs, _ in os.walk(self.project_root):
            if "__pycache__" in dirs:
                pycache_path = os.path.join(root, "__pycache__")
                try:
                    shutil.rmtree(pycache_path)
                    cleaned_count += 1
                except Exception as e:
                    logging.error(
                        f"FAILED TO DELETE CACHE: {pycache_path} | Error: {e}"
                    )
        if cleaned_count > 0:
            logging.info(
                f"Cache cleanup complete. {cleaned_count} __pycache__ folders deleted."
            )
        else:
            logging.info("No __pycache__ folders found.")

    def clean_python_comments(self, content):
        # Pola: Awal baris (^) + spasi (opsional) (\s*) + tanda pagar (#)
        pattern = re.compile(r"^\s*#.*$")
        return "\n".join(
            [line for line in content.splitlines() if not pattern.match(line)]
        )

    def clean_js_vue_comments(self, content):
        """
        Membersihkan baris penuh komentar JS/Vue.
        Hanya baris yang DIMULAI dengan '//' yang akan dihapus.
        """
        # Pola: Awal baris (^) + spasi (opsional) (\s*) + double slash (//)
        pattern = re.compile(r"^\s*//.*$")
        return "\n".join(
            [line for line in content.splitlines() if not pattern.match(line)]
        )
    def limit_newlines(self, content: str) -> str:
        """
        Mengganti 4 atau lebih newline berturut-turut menjadi 3 newline.
        """
        pattern = re.compile(r"\n{4,}")
        content_with_newlines = pattern.sub("\n\n\n", content)
        return content_with_newlines.strip() # Hapus spasi/newline di awal/akhir file
    def _generate_header_block(self, file_extension_logic, absolute_path, total_lines):
        """
        Membuat blok header yang sesuai dengan tipe file.
        Menggunakan # for shell-types, // for c-types, REM for .bat, and None for others.
        """
        comment_char = None
        website_url = "https://flowork.cloud"
        normalized_path = absolute_path.replace(os.sep, "/")
        if "/momod/" in normalized_path:
            website_url = "https://momod.flowork.cloud"
        if file_extension_logic in (".py", ".yml", ".yaml", ".sh", ".conf"):
            comment_char = "#"
        elif file_extension_logic in (".js", ".vue"):
            comment_char = "//"
        elif file_extension_logic == ".bat":
            comment_char = "REM"
        else:
            return None
        header_block = (
            f"{comment_char}#######################################################################\n"
            f"{comment_char} WEBSITE {website_url}\n"
            f"{comment_char} File NAME : {absolute_path} total lines {total_lines} \n"
            f"{comment_char}#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.\n"
            f"{comment_char}#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).\n"
            f"{comment_char}#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.\n"
            f"{comment_char}#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.\n"
            f"{comment_char}#######################################################################"
        )
        return header_block
    def process_source_files(self):
        logging.info(
            "--- STARTING SOURCE FILE FIX & STAMP OPERATION (EDIT MASAL UNTOOK SEMUA FILE) ---"
        )
        files_to_process = self.get_content_backup_files()
        for file_path in files_to_process:
            if os.path.abspath(file_path) == os.path.abspath(__file__):
                continue

            try:
                file_name = os.path.basename(file_path)
                file_extension_logic = ""
                if "." in file_name:
                    file_extension_logic = os.path.splitext(file_path)[1] # e.g., ".py"
                else:
                    file_extension_logic = file_name.lower() # cth: 'dockerfile'

                logging.info(f"PROCESSING {file_extension_logic} FILE: {file_name}")

                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    original_content = f.read()
                core_code = self.awenk_pattern.sub("", original_content)
                core_code = self.new_header_pattern.sub("", core_code)
                content_no_comments = ""
                if file_extension_logic == ".py":
                    content_no_comments = self.clean_python_comments(core_code)
                elif file_extension_logic in (".js", ".vue"):
                    content_no_comments = self.clean_js_vue_comments(core_code)
                elif file_extension_logic in (".yml", ".yaml"):
                    content_no_comments = self.clean_python_comments(core_code)
                else:
                    content_no_comments = core_code
                content_limited_newlines = self.limit_newlines(content_no_comments)

                if not content_limited_newlines.strip():
                    logging.info(
                        f"Skipping file with no core code: {file_name}"
                    )
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write("")
                    continue
                absolute_path = os.path.abspath(file_path)
                core_code_line_count = len(content_limited_newlines.splitlines())
                header_block = self._generate_header_block(
                    file_extension_logic,
                    absolute_path,
                    0 # Placeholder
                )

                final_content = ""
                header_line_count = 0
                if header_block:
                    header_line_count = 4 # 4 baris header
                    if core_code_line_count > 0:
                        header_line_count += 2 # 2 baris spasi (pemisah)

                    total_lines_after_write = core_code_line_count + header_line_count

                    # Buat ulang header dengan total lines yg benar
                    header_block = self._generate_header_block(
                        file_extension_logic,
                        absolute_path,
                        total_lines_after_write
                    )

                    if core_code_line_count > 0:
                        final_content = f"{header_block}\n\n{content_limited_newlines}\n"
                    else:
                        final_content = f"{header_block}\n" # Jika file hanya header

                else:
                    # Untuk file non-py (JSON, HTML, etc.), tulis apa adanya
                    total_lines_after_write = core_code_line_count
                    if total_lines_after_write > 0:
                        total_lines_after_write += 1 # 1 newline di akhir
                    final_content = content_limited_newlines + "\n"

                # Tulis kembali ke file asli
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(final_content)

            except Exception as e:
                logging.error(
                    f"MODIFICATION FAILED: {os.path.basename(file_path)} | Error: {e}"
                )
                logging.error(traceback.format_exc())

        logging.info("--- SOURCE FILE FIX & STAMP OPERATION COMPLETE ---")
    def get_content_backup_files(self):
        content_files = []
        logging.info("--- STARTING DETAILED FILE SCAN ---")
        for root, dirs, files in os.walk(self.project_root):
            original_dirs = list(dirs)
            dirs[:] = [d for d in dirs if d not in self.excluded_dirs_entirely]
            for d in original_dirs:
                if d not in dirs:
                    logging.info(
                        f"SKIPPING DIRECTORY (excluded): {os.path.join(root, d)}"
                    )
            for file in files:
                file_path = os.path.join(root, file)

                if file in self.excluded_files:
                    logging.info(f"SKIPPING FILE (excluded name): {file_path}")
                    continue

                file_extension = os.path.splitext(file)[1]
                if (
                    file_extension in self.allowed_extensions_for_content
                    or file in self.included_specific_files_for_content # Perbaikan logika
                ):
                    logging.info(f"ADDING FILE: {file_path}")
                    content_files.append(file_path)
                else:
                    if (
                        file_extension not in self.excluded_extensions_for_map
                    ):  # Cek agar tidak terlalu 'berisik'
                        logging.warning(
                            f"SKIPPING FILE (extension not allowed): {file_path}"
                        )
        logging.info("--- DETAILED FILE SCAN COMPLETE ---")
        return content_files
    def format_backup_content(self, file_path):
        file_name = os.path.basename(file_path)
        file_extension_highlight = ""
        if "." in file_name:
            file_extension_highlight = os.path.splitext(file_path)[1].lstrip(".")
        else:
            file_extension_highlight = file_name.lower() # cth: 'dockerfile'
        absolute_path = os.path.abspath(file_path)
        total_lines_on_disk = self._get_line_count(file_path)
        normalized_path = absolute_path.replace(os.sep, "/")
        if "/momod/" in normalized_path:
            website_url = "https://momod.flowork.cloud"
        else:
            website_url = "https://flowork.cloud"
        header_block = (
            "#######################################################################\n"
            f"# WEBSITE {website_url}\n"
            f"# File NAME : {absolute_path} JUMLAH BARIS {total_lines_on_disk} \n"
            "#######################################################################"
        )

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content_from_disk = f.read()
            content_no_header = self.awenk_pattern.sub("", content_from_disk)
            content_no_header = self.new_header_pattern.sub("", content_no_header)
            content = content_no_header.strip()

            if not content: # Cek di sini setelah di-strip()
                return f"{header_block}\n\n```\n# FILE INI KOSONG (EMPTY FILE)\n```"
            else:
                return f"{header_block}\n\n```{file_extension_highlight}\n{content}\n```"

        except Exception as e:
            logging.error(f"FAILED TO READ (for backup): {file_path} | Error: {e}")
            return None

    def run_backup_cycle(self):
        logging.info("--- STARTING MAIN CYCLE ---")
        self.clean_pycache()
        logging.info("Waiting 1 second after cache cleanup.")
        time.sleep(1)
        self.process_source_files()
        logging.info("Waiting 1 second after source file modification.")
        time.sleep(1)

        logging.info(
            f"Starting archive creation process to '{self.backup_file_path}'..."
        )
        os.makedirs(self.backup_dir, exist_ok=True)
        files_to_archive = self.get_content_backup_files()

        with open(self.backup_file_path, "w", encoding="utf-8") as backup_f:
            all_content_blocks = []
            for file_path in files_to_archive:
                formatted_content = self.format_backup_content(file_path)
                if formatted_content:
                    all_content_blocks.append(formatted_content)

            backup_f.write("\n\n".join(all_content_blocks))

        logging.info(
            f"Archive '{self.backup_filename}' successfully created in data/plan folder. {len(all_content_blocks)} file contents were archived."
        )
        logging.info("--- MAIN CYCLE COMPLETE ---\n")

def main():
    """
    The main entry point to start the backup process.
    This script's single responsibility is to launch the system.
    """
    project_root = os.getcwd()
    archiver_instance = Archiver(project_root=project_root)
    archiver_instance.run_backup_cycle()

if __name__ == "__main__":
    main()