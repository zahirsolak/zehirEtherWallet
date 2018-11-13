xcopy dist ..\zehirwallet-gh-pages /e
cd ..\zehirwallet-gh-pages
git add *.*
git commit -m "Deploy"
git push origin gh-pages
cd ..\cold-staking-app
