#ifdef __linux__
#include <array>
#include <dlfcn.h>
#include <string>
#endif

#include "view.hpp"

#ifdef __linux__
namespace {
std::string moduleDir() {
	Dl_info info{};
	if (dladdr(reinterpret_cast<void *>(&moduleDir), &info) == 0 || info.dli_fname == nullptr) {
		return ".";
	}

	const std::string filename(info.dli_fname);
	const std::size_t pos = filename.find_last_of('/');
	return pos == std::string::npos ? "." : filename.substr(0, pos);
}

const char *nativeBin() {
#if defined(__aarch64__)
	return "bin-aarch64";
#else
	return "bin-linux";
#endif
}

bool tryLoad(const std::string &path) {
	void *handle = dlopen(path.c_str(), RTLD_NOW | RTLD_GLOBAL);
	if (handle != nullptr) {
		return true;
	}

	dlerror();
	return false;
}

void preloadPackageLib(const char *packageName, const char *libraryName) {
	const std::string dir = moduleDir();
	const std::string bin = nativeBin();
	const std::array<std::string, 5> candidates{
		dir + "/" + libraryName,
		dir + "/../node_modules/@node-3d/" + packageName + "/" + bin + "/" + libraryName,
		dir + "/../../" + packageName + "/" + bin + "/" + libraryName,
		dir + "/../../@node-3d/" + packageName + "/" + bin + "/" + libraryName,
		libraryName,
	};

	for (const std::string &candidate : candidates) {
		if (tryLoad(candidate)) {
			return;
		}
	}
}
} // namespace
#endif


Napi::Object initModule(Napi::Env env, Napi::Object exports) {
// Preload the libs with OUR @RPATH, not some junk builtin rpaths
#ifdef __linux__
	preloadPackageLib("deps-qt-core", "libQt6Core.so.6");
	preloadPackageLib("deps-qt-core", "libQt6DBus.so.6");
	preloadPackageLib("deps-qt-core", "libQt6Network.so.6");
	preloadPackageLib("deps-qt-core", "libicudata.so.73");
	preloadPackageLib("deps-qt-core", "libicui18n.so.73");
	preloadPackageLib("deps-qt-core", "libicuio.so.73");
	preloadPackageLib("deps-qt-core", "libicutest.so.73");
	preloadPackageLib("deps-qt-core", "libicutu.so.73");
	preloadPackageLib("deps-qt-core", "libicuuc.so.73");
	preloadPackageLib("deps-qt-gui", "libQt6Gui.so.6");
	preloadPackageLib("deps-qt-gui", "libQt6OpenGL.so.6");
	preloadPackageLib("deps-qt-gui", "libQt6Svg.so.6");
	preloadPackageLib("deps-qt-gui", "libQt6Widgets.so.6");
	preloadPackageLib("deps-qt-gui", "libQt6XcbQpa.so.6");
	preloadPackageLib("deps-qt-gui", "libQt6WaylandClient.so.6");
	preloadPackageLib("deps-qt-gui", "libQt6WaylandEglClientHwIntegration.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6Qml.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QmlMeta.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6Quick.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickControls2.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickTemplates2.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickWidgets.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickVectorImage.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QmlCompiler.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QmlCore.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickControls2Basic.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickControls2BasicStyleImpl.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickControls2Impl.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickDialogs2.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickDialogs2QuickImpl.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickDialogs2Utils.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickEffects.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickLayouts.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickParticles.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QuickShapes.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QmlWorkerScript.so.6");
	preloadPackageLib("deps-qt-qml", "libQt6QmlModels.so.6");
	preloadPackageLib("deps-qmlui", "libqmlui.so");
#endif

	View::initClass(env, exports);
	return exports;
}


NODE_API_MODULE(qml, initModule)
