#include<iostream>
#include<bits/stdc++.h>
#include<string>
using namespace std;
#define ll long long int
 int main()
 {
       string num1,num2;
       getline(cin,num1);
       getline(cin,num2);
       int len1,len2;
       string str;
       len1=num1.length();
       len2=num2.length(); int rem=0;
       while(len1>0&&len2){
              int temp1=(int)num1[len1-1] - 48;
              int temp2=(int)num2[len2-1] - 48;
              int total=temp1+temp2+rem;
              rem=total/10;
              int j=total%10;
              char ch= (char)j+48;
              str.push_back(ch);
              len1--;
              len2--;
       }
       while(len1>0){
                      int temp1=(int)num1[len1-1] - 48;
        int total=temp1+rem;
        rem=total/10;
              int j=total%10;
               char ch= (char)j+48;
              str.push_back(ch);
              len1--;
       }
        while(len2>0){
                            int temp1=(int)num2[len2-1] - 48;
        int total=temp1+rem;
        rem=total/10;
              int j=total%10;
               char ch= (char)j+48;
              str.push_back(ch);
              len2--;
       }
       if(rem>0){
                     char ch=(char)rem+48;
              str.push_back(ch);
       }
       int len3=str.length();
       reverse(str.begin(),str.end());
       cout<<str<<endl;

     return 0;
 }
