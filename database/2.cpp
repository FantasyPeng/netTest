#include <bits/stdc++.h>
#define maxn 100009
using namespace std;
char s[maxn];
map<int,int>mp;
int n;
int main(){
    scanf("%s",s);
    n = strlen(s);
    mp[0] = 1;
    int cur = 0;
    long long ans = 0;
    for(int i = 0; i < n; i++){
        int x = s[i] - 'a';
        cur ^= (1 << x);
        ans += mp[cur];
        mp[cur]++;
    }
    cout << ans << endl;
    return 0;
}
