#include <algorithm>
#include <cmath>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <emscripten/bind.h>
using namespace std;
struct Station{string id,name,status;double lat,lon;};
struct Vehicle{string stopId,name,route,times,status;};
struct BusTime{string time,status;int delta;};
struct Result{Station station;double distance;vector<Vehicle> vehicles;};
vector<string> split(const string& line,char delim=','){vector<string> v;stringstream ss(line);string x;while(getline(ss,x,delim))v.push_back(x);return v;}
string esc(const string& s){string o;for(char c:s){if(c=='"'||c=='\\')o+='\\';if(c=='\n')o+="\\n";else o+=c;}return o;}
double rad(double d){return d*3.14159265358979323846/180.0;}
double distanceKm(double a,double b,double c,double d){double p=rad(c-a),q=rad(d-b);double x=sin(p/2)*sin(p/2)+cos(rad(a))*cos(rad(c))*sin(q/2)*sin(q/2);return 6371.0*2*atan2(sqrt(x),sqrt(1-x));}
vector<Station> readStations(){vector<Station> v;ifstream f("stations.txt");string line;while(getline(f,line)){if(line.empty()||line[0]=='#')continue;auto x=split(line);if(x.size()<5)continue;try{v.push_back({x[0],x[1],x[4],stod(x[2]),stod(x[3])});}catch(...){}}return v;}
vector<Vehicle> readVehicles(){vector<Vehicle> v;ifstream f("vehicles.txt");string line;while(getline(f,line)){if(line.empty()||line[0]=='#')continue;auto x=split(line);if(x.size()>=5)v.push_back({x[0],x[1],x[2],x[3],x[4]});}return v;}
int toMinutes(const string&t){if(t.size()<5)return -1;try{return stoi(t.substr(0,2))*60+stoi(t.substr(3,2));}catch(...){return -1;}}
string findNearestStops(double lat,double lon,int limit,int nowMinutes){
 auto stations=readStations();auto vehicles=readVehicles();vector<Result> all;
 for(auto s:stations){Result r{s,distanceKm(lat,lon,s.lat,s.lon),{}};for(auto v:vehicles)if(v.stopId==s.id)r.vehicles.push_back(v);all.push_back(r);}
 sort(all.begin(),all.end(),[](const Result&a,const Result&b){return a.distance<b.distance;});
 if(limit<1)limit=1;if(limit>(int)all.size())limit=all.size();ostringstream o;o<<"[";
 for(int i=0;i<limit;i++){if(i)o<<",";auto&r=all[i];o<<"{\"id\":\""<<esc(r.station.id)<<"\",\"name\":\""<<esc(r.station.name)<<"\",\"latitude\":"<<r.station.lat<<",\"longitude\":"<<r.station.lon<<",\"distance_km\":"<<r.distance<<",\"data_status\":\""<<esc(r.station.status)<<"\",\"vehicles\":[";
  vector<string> busJson;
  for(auto&v:r.vehicles){auto ts=split(v.times,';');vector<BusTime> upcoming,passed;for(auto&t:ts){int m=toMinutes(t);if(m<0)continue;int delta=m-nowMinutes;string st=delta<0?"Passed":(delta<=2?"Passing now":"Upcoming");BusTime bt{t,st,delta};if(delta<0)passed.push_back(bt);else upcoming.push_back(bt);}
   sort(upcoming.begin(),upcoming.end(),[](auto&a,auto&b){return a.delta<b.delta;});sort(passed.begin(),passed.end(),[](auto&a,auto&b){return a.delta>b.delta;});
   vector<BusTime> ordered=upcoming;ordered.insert(ordered.end(),passed.begin(),passed.end());ostringstream b;b<<"{\"name\":\""<<esc(v.name)<<"\",\"route\":\""<<esc(v.route)<<"\",\"data_status\":\""<<esc(v.status)<<"\",\"times\":[";
   for(size_t k=0;k<ordered.size();k++){if(k)b<<",";auto&t=ordered[k];b<<"{\"time\":\""<<esc(t.time)<<"\",\"status\":\""<<t.status<<"\",\"minutes_delta\":"<<t.delta<<"}";}b<<"]}";busJson.push_back(b.str());}
  for(size_t j=0;j<busJson.size();j++){if(j)o<<",";o<<busJson[j];}o<<"]}";
 }o<<"]";return o.str();
}
EMSCRIPTEN_BINDINGS(bus_finder){emscripten::function("findNearestStops",&findNearestStops);}
