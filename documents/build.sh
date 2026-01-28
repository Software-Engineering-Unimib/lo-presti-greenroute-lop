set -u

if [[ $# -lt 1 ]]; then
    echo "Usage: ./build.sh <tex file name>.tex"
    exit 1
fi

# variabili
MAINFILE="$1"
PASSES=2
BUILD_DIR="build"

mkdir -p "$BUILD_DIR"

for (( i=1; i<=PASSES; i++ )); do
    echo "Running pdflatex (pass $i)..."
    pdflatex -interaction=nonstopmode -output-directory="$BUILD_DIR" "$MAINFILE"
    STATUS=$?
    if [[ $STATUS -ne 0 ]]; then
        echo "Error: pdflatex failed on pass $i with code $STATUS."
        exit $STATUS
    fi
done

echo "Compilation succeeded."

# clean up
echo "Cleaning up auxiliary files..."
cd "$BUILD_DIR" || exit 1
rm -f *.aux *.log *.toc

echo "Build completed successfully!"
