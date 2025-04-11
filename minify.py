"""
 * Copyright (c) 2025 SingChun LEE @ Bucknell University. CC BY-NC 4.0.
 * 
 * This code is provided mainly for educational purposes at Bucknell University.
 *
 * This code is licensed under the Creative Commons Attribution-NonCommerical 4.0
 * International License. To view a copy of the license, visit 
 *   https://creativecommons.org/licenses/by-nc/4.0/
 * or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 *
 * You are free to:
 *  - Share: copy and redistribute the material in any medium or format.
 *  - Adapt: remix, transform, and build upon the material.
 *
 * Under the following terms:
 *  - Attribution: You must give appropriate credit, provide a link to the license,
 *                 and indicate if changes where made.
 *  - NonCommerical: You may not use the material for commerical purposes.
 *  - No additional restrictions: You may not apply legal terms or technological 
 *                                measures that legally restrict others from doing
 *                                anything the license permits.
"""

import sys
import re
import os
import rjsmin

def combineContent(file, curDir, imported):
  # NOTE: This does not allow files with the same name in different locations
  if os.path.basename(file) in imported: return r'' # already imported
  imported.add(os.path.basename(file))
  print(os.path.realpath(os.path.join(curDir, file)))
  with open(os.path.realpath(os.path.join(curDir, file)), 'r') as open_file:
    content = open_file.read()
  # import files
  pattern = r'(import +.*? +from +[\'"](.*?)[\'"]\s*)'
  matches = re.findall(pattern, content)
  for oldText, importFile in matches:
    fileContent = combineContent(importFile, os.path.dirname(os.path.realpath(os.path.join(curDir, file))), imported)
    content = content.replace(oldText, fileContent + '\n\n')
  return content

def main():
  if len(sys.argv) < 2:
    print("Usage: python combine.py <the entry js file>")
  else:
    imported = set()
    content = combineContent(sys.argv[1], os.path.dirname(sys.argv[1]), imported)
    # get rid of export default 
    content = content.replace("export default ", '')
    # replace "*/*.wgsl" with "*/optimized_*.wgsl"
    # use it when you also obfuscated your shader code
    pattern = r'[\'"](.*.wgsl)[\'"]'
    matches = re.findall(pattern, content)
    for oldText in matches:
      content = content.replace(oldText, os.path.dirname(oldText) + "/optimized_" + os.path.basename(oldText))
    with open(os.path.splitext(os.path.basename(sys.argv[1]))[0] + "-full.js", 'w') as file:
      file.write(rjsmin.jsmin(content))
    
if __name__ == "__main__":
  main()