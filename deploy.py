#!/usr/bin/env python3
"""
Europe Travel Guide v2.0 - Deploy Script
First Phase: UI Reconstruction
"""

import subprocess
import sys
import os

def run_command(cmd, cwd=None):
    """Run shell command and return output"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        print(f"Stdout: {e.stdout}")
        print(f"Stderr: {e.stderr}")
        return None

def main():
    project_dir = "/root/.openclaw/workspace/europe-travel-guide"
    
    print("=" * 60)
    print("🚀 Europe Travel Guide v2.0 - Deploy")
    print("=" * 60)
    
    # Check git status
    print("\n📋 Checking git status...")
    status = run_command("git status --short", cwd=project_dir)
    if status:
        print(f"Modified files:\n{status}")
    
    # Add all changes
    print("\n📦 Adding changes...")
    result = run_command("git add .", cwd=project_dir)
    if result is None:
        print("❌ Failed to add files")
        return
    print("✅ Files added")
    
    # Commit
    print("\n💾 Committing...")
    commit_msg = "v2.0: UI Reconstruction - Mobile First, Medical Aesthetic Style"
    result = run_command(f'git commit -m "{commit_msg}"', cwd=project_dir)
    if result is None:
        print("⚠️ Nothing to commit or commit failed")
    else:
        print("✅ Committed")
    
    # Push to main
    print("\n🌐 Pushing to GitHub...")
    result = run_command("git push origin main", cwd=project_dir)
    if result is None:
        print("❌ Push failed")
        return
    print("✅ Pushed to main")
    
    print("\n" + "=" * 60)
    print("✨ Deploy complete!")
    print("=" * 60)
    print("\n🌐 Live URL:")
    print("   https://wugys.github.io/europe-travel-guide/")
    print("\n⏱️  Wait 1-2 minutes for GitHub Pages to update")
    print("=" * 60)

if __name__ == "__main__":
    main()
