rd ..\zehirwallet-gh-pages /s /q
git clone https://github.com/zahirsolak/zehirwallet.git ..\zehirwallet-gh-pages -b gh-pages

xcopy dist ..\zehirwallet-gh-pages /e
cd ..\zehirwallet-gh-pages

git add *.*
git commit -m "Deploy"
git push origin gh-pages

cd ..\zehirwallet
